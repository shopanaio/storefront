import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hash = (value) => createHash('sha256').update(value).digest('hex');
const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    throw new Error(
      'Cannot read runtime JSON; check that the file exists and contains valid JSON.'
    );
  }
};
const fail = (message) => {
  throw new Error(message);
};

// Deliberately do not source a shell file: deploy inputs must never execute code.
export function parseEnv(source) {
  const values = {};
  const allowed = new Set([
    'THEME_IMAGE',
    'CLOUDFLARED_IMAGE',
    'BACKEND_NETWORK',
    'TUNNEL_SECRET',
    'SERVER_ENV_SECRET',
    'LAUNCHER_CONFIG',
  ]);
  for (const line of source.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const match = /^([A-Z_]+)=([A-Za-z0-9_./:@-]+)$/.exec(line);
    if (!match || !allowed.has(match[1]) || match[1] in values) {
      fail(
        'Invalid or duplicate deploy.env assignment; use plain KEY=value entries.'
      );
    }
    values[match[1]] = match[2];
  }
  for (const key of allowed) {
    if (!values[key]) fail(`Missing ${key} in deploy.env`);
  }
  if (!/@sha256:[a-f0-9]{64}$/.test(values.THEME_IMAGE)) {
    fail('THEME_IMAGE must be an immutable sha256 digest.');
  }
  return values;
}

export function validateRuntime(values, outputs) {
  if (!values || Array.isArray(values) || typeof values !== 'object')
    fail('Runtime settings must be an object.');
  for (const [key, value] of Object.entries(values)) {
    if (typeof value !== 'string' || /REPLACE_WITH|example\.com/.test(value)) {
      fail(`Fill runtime setting ${key}`);
    }
  }
  if (
    !/^shpna_sfpub_v1_[A-Za-z0-9_-]{22}_[A-Za-z0-9_-]{43}$/.test(
      values.NEXT_PUBLIC_API_KEY ?? ''
    )
  ) {
    fail('NEXT_PUBLIC_API_KEY must be a PUBLIC Headless token.');
  }
  if ((values.STOREFRONT_SESSION_SECRET?.length ?? 0) < 32)
    fail('Session secret must have at least 32 characters.');
  for (const [key, output] of Object.entries({
    NEXT_PUBLIC_APP_URL: 'app_url',
    NEXT_PUBLIC_GRAPHQL_URL: 'graphql_url',
    NEXT_PUBLIC_IAM_URL: 'iam_url',
    NEXT_PUBLIC_PET_ASSISTANT_URL: 'pet_assistant_url',
  })) {
    if (values[key] !== outputs[output])
      fail(`${key} must match Terraform output ${output}`);
  }
  if (
    values.STOREFRONT_SERVER_GRAPHQL_URL &&
    !/^https?:\/\/[^/\s]+\/\S*$/.test(values.STOREFRONT_SERVER_GRAPHQL_URL)
  )
    fail('STOREFRONT_SERVER_GRAPHQL_URL must be an absolute HTTP URL.');
  if (values.STOREFRONT_TRUSTED_PROXY_HOPS !== '1')
    fail(
      'The theme requires one trusted proxy hop for its direct Tunnel ingress.'
    );
  if (values.NEXT_PUBLIC_IAM_URL) {
    for (const key of [
      'NEXT_PUBLIC_IAM_APPLICATION_ID',
      'IAM_OAUTH_CLIENT_ID',
      'IAM_OAUTH_CLIENT_SECRET',
      'IAM_OAUTH_RESOURCE',
    ]) {
      if (!values[key]) fail(`${key} is required when IAM is enabled.`);
    }
    let callback;
    try {
      callback = new URL(values.IAM_OAUTH_REDIRECT_URI);
    } catch {
      fail('IAM_OAUTH_REDIRECT_URI must be an absolute HTTPS callback.');
    }
    if (
      callback.protocol !== 'https:' ||
      callback.username ||
      callback.password ||
      callback.search ||
      callback.hash ||
      callback.pathname !== '/auth/callback'
    )
      fail('IAM_OAUTH_REDIRECT_URI must be an absolute HTTPS callback.');
    if (
      values.IAM_OAUTH_POST_LOGOUT_REDIRECT_URI &&
      values.IAM_OAUTH_POST_LOGOUT_REDIRECT_URI !== `${outputs.app_url}/`
    )
      fail(
        'IAM_OAUTH_POST_LOGOUT_REDIRECT_URI must use the theme origin or be empty for local sign-out.'
      );
  }
}

export async function verifyHeadlessOAuth(values, fetcher = fetch) {
  if (!values.NEXT_PUBLIC_IAM_URL) return;
  const base = `${values.NEXT_PUBLIC_IAM_URL}/auth/applications/${encodeURIComponent(values.NEXT_PUBLIC_IAM_APPLICATION_ID)}/headless/v1`;
  const credentials = Buffer.from(
    `${encodeURIComponent(values.IAM_OAUTH_CLIENT_ID)}:${encodeURIComponent(values.IAM_OAUTH_CLIENT_SECRET)}`
  ).toString('base64');
  const response = await fetcher(`${base}/configuration`, {
    headers: {
      Authorization: `Basic ${credentials}`,
      'shopana-end-user-ip': '127.0.0.1',
      'User-Agent': 'Mozilla/5.0 ShopanaThemeDeploy',
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok)
    fail(`Headless IAM client preflight failed: HTTP ${response.status}.`);
  const configuration = await response.json();
  if (!configuration.methods) fail('Headless IAM configuration is invalid.');
  if (
    new URL(values.IAM_OAUTH_REDIRECT_URI).origin !==
      values.NEXT_PUBLIC_APP_URL &&
    configuration.methods.social?.length
  )
    fail('Social sign-in requires a callback on the theme origin.');
}

export function validateBackend(gateway, runtime, traefik, networkId, values) {
  for (const [name, service] of [
    ['gateway-storefront', gateway],
    ['runtime-monolith', runtime],
    ['traefik', traefik],
  ]) {
    if (
      !service.Spec.TaskTemplate.Networks?.some(
        (network) => network.Target === networkId
      )
    ) {
      fail(`${name} must be connected to the existing backend edge overlay.`);
    }
  }
  const env = (service, key) =>
    service.Spec.TaskTemplate.ContainerSpec.Env?.find((value) =>
      value.startsWith(`${key}=`)
    )?.slice(key.length + 1);
  if (env(gateway, 'STOREFRONT_TRUSTED_PROXY_HOPS') !== '2') {
    fail(
      'Backend gateway must trust two proxy hops for the Cloudflare → Traefik route.'
    );
  }
  if (
    values.NEXT_PUBLIC_IAM_URL &&
    env(runtime, 'IAM_PUBLIC_BASE_URL') !== values.NEXT_PUBLIC_IAM_URL
  ) {
    fail(
      'Backend IAM_PUBLIC_BASE_URL differs from NEXT_PUBLIC_IAM_URL; use the existing canonical IAM origin.'
    );
  }
}

async function main() {
  const [action, profile = 'stage', flag, context, imageSource] =
    process.argv.slice(2);
  if (
    !['init', 'check', 'deploy', 'status', 'smoke'].includes(action) ||
    !['stage', 'production'].includes(profile) ||
    (flag && (flag !== '--context' || !context)) ||
    (imageSource &&
      (imageSource !== '--preloaded' ||
        !['check', 'deploy'].includes(action))) ||
    process.argv.length > 7
  ) {
    fail(
      'Usage: node scripts/deploy-theme.mjs init|check|deploy|status|smoke stage|production [--context NAME] [--preloaded]'
    );
  }
  const directory = resolve(root, 'deploy/environments', profile);
  const envPath = resolve(directory, 'deploy.env');
  const runtimePath = resolve(directory, 'server-env.json');
  const launcher = readFileSync(resolve(root, 'deploy/runtime/start.cjs'));
  const stack = `shopana-theme-${profile}`;
  if (action === 'init') {
    if (!existsSync(envPath)) {
      writeFileSync(
        envPath,
        readFileSync(`${envPath}.example`, 'utf8').replace(
          'REPLACE_WITH_CONTENT_HASH',
          hash(launcher).slice(0, 12)
        ),
        { mode: 0o600, flag: 'wx' }
      );
    }
    if (!existsSync(runtimePath)) {
      const values = readJson(`${runtimePath}.example`);
      values.STOREFRONT_SESSION_SECRET = randomBytes(48).toString('base64url');
      writeFileSync(runtimePath, `${JSON.stringify(values, null, 2)}\n`, {
        mode: 0o600,
        flag: 'wx',
      });
    }
    console.log(
      `Prepared deploy/environments/${profile}/{deploy.env,server-env.json}; fill the remaining runtime credentials. Existing files were preserved.`
    );
    return;
  }
  if (action === 'status') {
    if (!context) fail('Pass --context NAME explicitly.');
    for (const args of [
      ['stack', 'services', stack],
      ['stack', 'ps', stack, '--no-trunc'],
    ]) {
      execFileSync('docker', ['--context', context, ...args], {
        cwd: root,
        stdio: 'inherit',
        timeout: 30_000,
      });
    }
    return;
  }
  const settings = parseEnv(readFileSync(envPath, 'utf8'));
  settings.LAUNCHER_CONFIG = `${stack}-launcher-${hash(launcher).slice(0, 12)}`;
  const values = readJson(runtimePath);
  const run = (binary, args, options = {}) => {
    try {
      return execFileSync(binary, args, {
        cwd: root,
        encoding: 'utf8',
        timeout: 120_000,
        maxBuffer: 16 * 1024 * 1024,
        env: { ...process.env, ...settings },
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options,
      });
    } catch {
      // CLI stderr can include secret JSON or Terraform output. Never echo it.
      fail(
        `${binary} ${args.slice(0, 2).join(' ')} failed. Check connectivity, registry credentials and local Terraform state; secret output was suppressed.`
      );
    }
  };
  const terraform = (...args) =>
    run('terraform', [
      `-chdir=deploy/terraform/environments/${profile}`,
      ...args,
    ]);
  const outputs = Object.fromEntries(
    ['app_url', 'graphql_url', 'iam_url', 'pet_assistant_url'].map((name) => [
      name,
      terraform('output', '-raw', name).trim(),
    ])
  );
  validateRuntime(values, outputs);
  if (action === 'smoke') {
    await smoke(values);
    return;
  }
  if (!context)
    fail(
      'Pass --context NAME explicitly; the current/default Docker context is never used.'
    );
  const docker = (...args) => run('docker', ['--context', context, ...args]);
  const info = JSON.parse(docker('info', '--format', '{{json .Swarm}}'));
  if (info.LocalNodeState !== 'active' || !info.ControlAvailable)
    fail('The selected context must point to a manager of the existing Swarm.');
  const nodes = JSON.parse(
    docker('node', 'inspect', ...docker('node', 'ls', '-q').trim().split(/\s+/))
  );
  const eligible = nodes.filter(
    (node) =>
      node.Status.State === 'ready' &&
      node.Spec.Availability === 'active' &&
      node.Description.Platform.OS === 'linux' &&
      ['amd64', 'x86_64'].includes(node.Description.Platform.Architecture)
  );
  if (eligible.length < 3)
    fail(
      'At least three ready, active linux/amd64 nodes are required for start-first connector updates.'
    );
  const network = JSON.parse(
    docker('network', 'inspect', settings.BACKEND_NETWORK)
  )[0];
  if (network.Driver !== 'overlay' || network.Scope !== 'swarm')
    fail('BACKEND_NETWORK must be an existing Swarm overlay.');
  const [gateway, runtime, traefik] = JSON.parse(
    docker(
      'service',
      'inspect',
      `shopana-${profile}-app_gateway-storefront`,
      `shopana-${profile}-app_runtime-monolith`,
      `shopana-${profile}-platform_traefik`
    )
  );
  validateBackend(gateway, runtime, traefik, network.Id, values);
  await verifyHeadlessOAuth(values);
  const routeConfig = traefik.Spec.TaskTemplate.ContainerSpec.Configs?.find(
    (config) => config.File?.Name === '/etc/traefik/routes.yml'
  );
  if (!routeConfig)
    fail('Existing Traefik must mount /etc/traefik/routes.yml.');
  const routes = Buffer.from(
    JSON.parse(docker('config', 'inspect', routeConfig.ConfigID))[0].Spec.Data,
    'base64'
  ).toString('utf8');
  for (const key of [
    'storefront_api_host_header',
    'pet_assistant_host_header',
  ]) {
    const hostname = terraform('output', '-raw', key).trim();
    if (hostname && !routes.includes(`Host(\`${hostname}\`)`)) {
      fail(`Existing Traefik has no Host router for Terraform output ${key}.`);
    }
  }
  const trusted = traefik.Spec.TaskTemplate.ContainerSpec.Args?.find((arg) =>
    arg.startsWith('--entrypoints.web.forwardedHeaders.trustedIPs=')
  )
    ?.split('=')[1]
    ?.split(',');
  if (
    !network.IPAM?.Config?.some((config) => trusted?.includes(config.Subnet))
  ) {
    fail(
      'Existing Traefik must trust forwarded headers from the backend edge subnet.'
    );
  }
  docker('stack', 'config', '-c', 'deploy/swarm/theme.yml');
  if (imageSource === '--preloaded') {
    const cached = JSON.parse(
      docker('image', 'inspect', settings.THEME_IMAGE)
    )[0];
    if (
      cached.Os !== 'linux' ||
      cached.Architecture !== 'amd64' ||
      !cached.RepoDigests?.includes(settings.THEME_IMAGE)
    )
      fail(
        'The exact linux/amd64 digest must be preloaded on the manager and every eligible node.'
      );
  } else {
    docker('manifest', 'inspect', settings.THEME_IMAGE);
  }
  console.log(
    `Preflight passed: ${context}, existing Swarm, ${eligible.length} nodes, ${settings.BACKEND_NETWORK}, separate stack ${stack}.`
  );
  if (action === 'check') return;

  const ensureSecret = (name, data) => {
    const digest = hash(data);
    const names = docker('secret', 'ls', '--format', '{{.Name}}')
      .trim()
      .split('\n');
    if (names.includes(name)) {
      const existing = JSON.parse(docker('secret', 'inspect', name))[0];
      if (existing.Spec.Labels?.['shopana.theme.sha256'] !== digest) {
        fail(
          `Secret ${name} exists with different or unverified content. Set a new versioned name in deploy.env; secrets are never overwritten.`
        );
      }
      return;
    }
    run(
      'docker',
      [
        '--context',
        context,
        'secret',
        'create',
        '--label',
        `shopana.theme.sha256=${digest}`,
        name,
        '-',
      ],
      { input: data }
    );
  };
  const token = terraform('output', '-raw', 'tunnel_token').trim();
  if (!token) fail('The local Terraform state has no tunnel token.');
  ensureSecret(settings.SERVER_ENV_SECRET, readFileSync(runtimePath));
  ensureSecret(settings.TUNNEL_SECRET, token);
  docker(
    'stack',
    'deploy',
    '--with-registry-auth',
    '--resolve-image',
    imageSource === '--preloaded' ? 'never' : 'always',
    '--detach=true',
    '-c',
    'deploy/swarm/theme.yml',
    stack
  );
  console.log(`Deployed ${stack}; waiting up to 10 minutes for both services.`);
  const deadline = Date.now() + 600_000;
  while (Date.now() < deadline) {
    const services = JSON.parse(
      docker('service', 'inspect', `${stack}_theme`, `${stack}_cloudflared`)
    );
    if (
      services.find((service) => service.Spec.Name === `${stack}_theme`).Spec
        .TaskTemplate.ContainerSpec.Image !== settings.THEME_IMAGE
    )
      fail('The theme service did not adopt the requested digest.');
    for (const service of services) {
      if (
        [
          'paused',
          'rollback_started',
          'rollback_paused',
          'rollback_completed',
        ].includes(service.UpdateStatus?.State)
      ) {
        fail(
          `${service.Spec.Name}: ${service.UpdateStatus.State}. Inspect service ps/logs; the requested deployment did not succeed.`
        );
      }
    }
    const summary = docker(
      'stack',
      'services',
      stack,
      '--format',
      '{{.Name}} {{.Replicas}}'
    ).trim();
    const stable = services.every(
      (service) =>
        !service.UpdateStatus || service.UpdateStatus.State === 'completed'
    );
    if (
      stable &&
      summary.split('\n').length === 2 &&
      summary.split('\n').every((line) => line.endsWith(' 2/2'))
    ) {
      const tasks = JSON.parse(
        docker(
          'inspect',
          ...docker(
            'stack',
            'ps',
            stack,
            '--filter',
            'desired-state=running',
            '-q'
          )
            .trim()
            .split(/\s+/)
        )
      );
      if (
        tasks.length === 4 &&
        tasks.every(
          (task) =>
            task.Status.State === 'running' &&
            Date.now() - Date.parse(task.Status.Timestamp) > 90_000
        )
      ) {
        console.log(summary);
        await smoke(values);
        return;
      }
    }
    await delay(5000);
  }
  fail(
    'Deployment did not converge within 10 minutes; inspect stack ps and service logs.'
  );
}

async function smoke(values) {
  const get = (path, options = {}) =>
    fetch(new URL(path, values.NEXT_PUBLIC_APP_URL), {
      ...options,
      redirect: 'manual',
      signal: AbortSignal.timeout(30_000),
    });
  const page = await get('/');
  if (
    !page.ok ||
    !(page.headers.get('content-type') ?? '').includes('text/html')
  )
    fail(`Theme smoke failed: HTTP ${page.status}`);
  if (!/no-store/.test(page.headers.get('cache-control') ?? ''))
    fail('SSR HTML must use Cache-Control: no-store.');
  const html = await page.text();
  if (!html.includes('__shopanaPublicEnv'))
    fail('SSR runtime configuration is missing.');
  for (const key of ['STOREFRONT_SESSION_SECRET', 'IAM_OAUTH_CLIENT_SECRET']) {
    if (values[key] && html.includes(values[key]))
      fail('Private runtime configuration leaked into SSR HTML.');
  }
  const api = await get('/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: values.NEXT_PUBLIC_APP_URL,
      'x-shopana-storefront-access-token': values.NEXT_PUBLIC_API_KEY,
    },
    body: JSON.stringify({ query: '{ __typename }' }),
  });
  if (!api.ok || (await api.json()).data?.__typename !== 'Query')
    fail('Same-origin GraphQL smoke failed.');
  if (values.NEXT_PUBLIC_IAM_URL) {
    const path = `/auth/applications/${encodeURIComponent(values.NEXT_PUBLIC_IAM_APPLICATION_ID)}`;
    const response = await get(
      `${values.NEXT_PUBLIC_IAM_URL}/.well-known/oauth-authorization-server${path}`
    );
    if (
      !response.ok ||
      (await response.json()).issuer !== `${values.NEXT_PUBLIC_IAM_URL}${path}`
    ) {
      fail('Canonical IAM discovery/issuer smoke failed.');
    }
  }
  console.log(
    'Smoke passed: SSR, private settings, same-origin GraphQL and canonical IAM discovery. Interactive login and agent streaming still require a browser check.'
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
