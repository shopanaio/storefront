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
  const required = [
    'THEME_IMAGE',
    'CLOUDFLARED_IMAGE',
    'BACKEND_NETWORK',
    'TUNNEL_SECRET',
    'SERVER_ENV_SECRET',
    'LAUNCHER_CONFIG',
    // The coordinator of the static site (theme-static): its secrets (static-env.json).
    'STATIC_ENV_SECRET',
  ];
  // The static site bucket of the environment (Terraform output static_site of zone/); without
  // them the theme serves the static site of its image.
  // The coordinator (plans/static-coordinator.ru.md): the GitHub App of its dispatches, the admin
  // API and store of its event feed, the zone of its purges (step B).
  const optional = [
    'STATIC_STORE',
    'STATIC_ENDPOINT',
    'STATIC_GITHUB_REPOSITORY',
    'STATIC_GITHUB_APP_ID',
    'STATIC_GITHUB_INSTALLATION_ID',
    'SHOPANA_ADMIN_GRAPHQL_URL',
    'SHOPANA_STORE_NAME',
    'SHOPANA_EVENTS_TOKEN_URL',
    'SHOPANA_EVENTS_CLIENT_ID',
    'CLOUDFLARE_ZONE_ID',
  ];
  const allowed = new Set([...required, ...optional]);
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
  for (const key of required) {
    if (!values[key]) fail(`Missing ${key} in deploy.env`);
  }
  // Set either way: `docker stack deploy` must not take them from the operator's shell.
  for (const key of optional) values[key] ??= '';
  if (values.STATIC_ENDPOINT && !values.STATIC_STORE)
    fail('STATIC_ENDPOINT without STATIC_STORE: set both or neither.');
  if (values.STATIC_STORE) {
    if (
      !/^s3:\/\/[a-z0-9][a-z0-9-]{1,61}[a-z0-9](\/[A-Za-z0-9._-]+)*$/.test(
        values.STATIC_STORE
      )
    )
      fail('STATIC_STORE must be s3://<bucket>/<prefix>.');
    if (!/^https:\/\/[a-z0-9.-]+$/.test(values.STATIC_ENDPOINT ?? ''))
      fail(
        'STATIC_STORE needs STATIC_ENDPOINT, the https origin of the S3 API.'
      );
  }
  if (!/@sha256:[a-f0-9]{64}$/.test(values.THEME_IMAGE)) {
    fail('THEME_IMAGE must be an immutable sha256 digest.');
  }
  return values;
}

/** Keys the coordinator's secret may hold (deploy/runtime/start-static.cjs). */
const STATIC_ENV_KEYS = new Set([
  'SHOPANA_EVENTS_REFRESH_TOKEN',
  'STATIC_OPERATOR_TOKEN',
  'STOREFRONT_STATIC_COORDINATOR_TOKEN',
  'STATIC_GITHUB_APP_PRIVATE_KEY',
  'STOREFRONT_STATIC_S3_ACCESS_KEY_ID',
  'STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY',
  'CLOUDFLARE_PURGE_TOKEN',
]);

/**
 * The coordinator's secret (static-env.json): known keys, long tokens, and the internal token
 * the theme reports hits with (server-env.json) the same.
 */
export function validateStaticEnv(staticValues, values) {
  if (
    !staticValues ||
    Array.isArray(staticValues) ||
    typeof staticValues !== 'object'
  )
    fail('Coordinator settings must be an object.');
  for (const [key, value] of Object.entries(staticValues)) {
    if (!STATIC_ENV_KEYS.has(key))
      fail(`Unsupported coordinator setting ${key}`);
    if (typeof value !== 'string' || /REPLACE_WITH/.test(value))
      fail(`Fill coordinator setting ${key}`);
  }
  for (const key of [
    'STATIC_OPERATOR_TOKEN',
    'STOREFRONT_STATIC_COORDINATOR_TOKEN',
  ]) {
    if ((staticValues[key]?.length ?? 0) < 32)
      fail(`${key} must have at least 32 characters.`);
  }
  if (
    values.STOREFRONT_STATIC_COORDINATOR_TOKEN !==
    staticValues.STOREFRONT_STATIC_COORDINATOR_TOKEN
  )
    fail(
      'STOREFRONT_STATIC_COORDINATOR_TOKEN of server-env.json and static-env.json must be the same.'
    );
}

/**
 * A full build of the static site through the coordinator's API, after a new image: its pages
 * are rendered with the assets of that image.
 */
export async function requestFullBuild(
  appUrl,
  operatorToken,
  image,
  fetcher = fetch
) {
  const response = await fetcher(new URL('/__builder/api/builds', appUrl), {
    method: 'POST',
    headers: {
      authorization: `Bearer ${operatorToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ mode: 'full', image, reason: 'deploy' }),
    signal: AbortSignal.timeout(30_000),
  });
  if (response.status !== 202)
    fail(`The coordinator refused the full build (HTTP ${response.status}).`);
  return (await response.json()).requestId;
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
  const staticPath = resolve(directory, 'static-env.json');
  const launcher = readFileSync(resolve(root, 'deploy/runtime/start.cjs'));
  const staticLauncher = readFileSync(
    resolve(root, 'deploy/runtime/start-static.cjs')
  );
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
    // The internal token of hits is in both secrets: the theme sends it, the coordinator takes it.
    const internalToken = existsSync(runtimePath)
      ? readJson(runtimePath).STOREFRONT_STATIC_COORDINATOR_TOKEN
      : randomBytes(48).toString('base64url');
    if (!existsSync(runtimePath)) {
      const values = readJson(`${runtimePath}.example`);
      values.STOREFRONT_SESSION_SECRET = randomBytes(48).toString('base64url');
      values.STOREFRONT_STATIC_COORDINATOR_TOKEN = internalToken;
      writeFileSync(runtimePath, `${JSON.stringify(values, null, 2)}\n`, {
        mode: 0o600,
        flag: 'wx',
      });
    }
    if (!existsSync(staticPath)) {
      const values = readJson(`${staticPath}.example`);
      values.STATIC_OPERATOR_TOKEN = randomBytes(48).toString('base64url');
      values.STOREFRONT_STATIC_COORDINATOR_TOKEN =
        internalToken ?? 'REPLACE_WITH_THE_TOKEN_OF_SERVER_ENV';
      writeFileSync(staticPath, `${JSON.stringify(values, null, 2)}\n`, {
        mode: 0o600,
        flag: 'wx',
      });
    }
    console.log(
      `Prepared deploy/environments/${profile}/{deploy.env,server-env.json,static-env.json}; fill the remaining runtime credentials. Existing files were preserved.`
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
  settings.STATIC_LAUNCHER_CONFIG = `${stack}-static-launcher-${hash(staticLauncher).slice(0, 12)}`;
  settings.STATIC_ENVIRONMENT = profile;
  const values = readJson(runtimePath);
  const staticValues = readJson(staticPath);
  validateStaticEnv(staticValues, values);
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
  if (
    settings.STATIC_STORE &&
    !(
      values.STOREFRONT_STATIC_S3_ACCESS_KEY_ID &&
      values.STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY
    )
  )
    fail(
      'STATIC_STORE needs the read key of its bucket in server-env.json (Terraform output static_site_read_keys of zone/).'
    );
  if (action === 'smoke') {
    await smoke(values);
    return;
  }
  if (
    settings.STATIC_STORE &&
    !(
      staticValues.STOREFRONT_STATIC_S3_ACCESS_KEY_ID &&
      staticValues.STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY
    )
  )
    fail(
      'STATIC_STORE needs a key of its bucket in static-env.json for the snapshots of the index.'
    );
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
  ensureSecret(settings.STATIC_ENV_SECRET, readFileSync(staticPath));
  ensureSecret(settings.TUNNEL_SECRET, token);
  // The image the theme ran before: a new one is rendered whole by the coordinator.
  let previousImage = null;
  try {
    previousImage = JSON.parse(
      execFileSync(
        'docker',
        [
          '--context',
          context,
          'service',
          'inspect',
          `${stack}_theme`,
          '--format',
          '{{json .Spec.TaskTemplate.ContainerSpec.Image}}',
        ],
        { encoding: 'utf8', timeout: 30_000, stdio: ['pipe', 'pipe', 'pipe'] }
      )
    );
  } catch {
    // The first deploy of the stack.
  }
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
  console.log(`Deployed ${stack}; waiting up to 10 minutes for its services.`);
  const replicas = {
    [`${stack}_theme`]: '2/2',
    [`${stack}_cloudflared`]: '2/2',
    [`${stack}_theme-static`]: '1/1',
  };
  const deadline = Date.now() + 600_000;
  while (Date.now() < deadline) {
    const services = JSON.parse(
      docker('service', 'inspect', ...Object.keys(replicas))
    );
    for (const name of [`${stack}_theme`, `${stack}_theme-static`]) {
      if (
        services.find((service) => service.Spec.Name === name).Spec.TaskTemplate
          .ContainerSpec.Image !== settings.THEME_IMAGE
      )
        fail(`${name} did not adopt the requested digest.`);
    }
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
    const lines = summary.split('\n');
    if (
      stable &&
      lines.length === Object.keys(replicas).length &&
      lines.every((line) => {
        const [name, count] = line.split(' ');
        return replicas[name] === count;
      })
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
        tasks.length === 5 &&
        tasks.every(
          (task) =>
            task.Status.State === 'running' &&
            Date.now() - Date.parse(task.Status.Timestamp) > 90_000
        )
      ) {
        console.log(summary);
        await smoke(values);
        if (previousImage !== settings.THEME_IMAGE) {
          const requestId = await requestFullBuild(
            values.NEXT_PUBLIC_APP_URL,
            staticValues.STATIC_OPERATOR_TOKEN,
            settings.THEME_IMAGE
          );
          console.log(
            `New image: full build ${requestId} queued by the coordinator.`
          );
        }
        return;
      }
    }
    await delay(5000);
  }
  fail(
    'Deployment did not converge within 10 minutes; inspect stack ps and service logs.'
  );
}

/**
 * The theme on its public address (step A of the static site): a generated page from the
 * static site (`x-shopana-static: hit`, its ETag, 304 for it, its static facts), an unknown
 * one rendered live (`miss`, no-store), public settings from `/__env.js` only, no private value
 * in either, same-origin GraphQL and IAM discovery.
 */
export async function smoke(values, fetcher = fetch) {
  const get = (path, options = {}) =>
    fetcher(new URL(path, values.NEXT_PUBLIC_APP_URL), {
      ...options,
      redirect: 'manual',
      signal: AbortSignal.timeout(30_000),
    });
  const secrets = [
    'STOREFRONT_SESSION_SECRET',
    'IAM_OAUTH_CLIENT_SECRET',
    'STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY',
  ]
    .map((key) => values[key])
    .filter(Boolean);
  const assertPrivate = (body, what) => {
    if (secrets.some((secret) => body.includes(secret)))
      fail(`Private runtime configuration leaked into ${what}.`);
  };

  const env = await get('/__env.js');
  const envSource = env.ok ? await env.text() : '';
  if (!env.ok || !/no-cache/.test(env.headers.get('cache-control') ?? ''))
    fail(
      `/__env.js must answer 200 with Cache-Control: no-cache (HTTP ${env.status}).`
    );
  if (!envSource.includes(values.NEXT_PUBLIC_API_KEY))
    fail('/__env.js lacks the public runtime configuration.');
  assertPrivate(envSource, '/__env.js');
  if (
    values.STOREFRONT_SERVER_GRAPHQL_URL &&
    envSource.includes(values.STOREFRONT_SERVER_GRAPHQL_URL)
  )
    fail('The server GraphQL address leaked into /__env.js.');

  const page = await get('/');
  if (
    !page.ok ||
    !(page.headers.get('content-type') ?? '').includes('text/html')
  )
    fail(`Theme smoke failed: HTTP ${page.status}`);
  if (page.headers.get('x-shopana-static') !== 'hit')
    fail(
      'The home page must come from the static site (x-shopana-static: hit).'
    );
  if (
    page.headers.get('cache-control') !== 'public, max-age=0, must-revalidate'
  )
    fail('A static page must be revalidated on every load.');
  const etag = page.headers.get('etag');
  if (!etag) fail('A static page must have an ETag.');
  const html = await page.text();
  if (!html.includes('window.__shopanaStatic='))
    fail('The static page lacks its static facts (__shopanaStatic).');
  if (
    !html.includes('<script src="/__env.js">') ||
    html.includes('__shopanaPublicEnv=')
  )
    fail(
      'Documents must load the public settings from /__env.js, never inline.'
    );
  assertPrivate(html, 'static HTML');
  const again = await get('/', { headers: { 'if-none-match': etag } });
  if (again.status !== 304)
    fail(`If-None-Match must answer 304 (HTTP ${again.status}).`);

  const missing = await get(`/products/smoke-${Date.now().toString(36)}`);
  if (missing.headers.get('x-shopana-static') !== 'miss')
    fail(
      'A page without a file must be rendered live (x-shopana-static: miss).'
    );
  if (!/no-store/.test(missing.headers.get('cache-control') ?? ''))
    fail('SSR HTML must use Cache-Control: no-store.');
  const rendered = await missing.text();
  if (!rendered.includes('<script src="/__env.js">'))
    fail('SSR documents must load the public settings from /__env.js.');
  assertPrivate(rendered, 'SSR HTML');

  const coordinator = await get('/__builder/api/health');
  if (!coordinator.ok || (await coordinator.json()).ok !== true)
    fail(
      `The coordinator must answer /__builder/api/health (HTTP ${coordinator.status}).`
    );

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
    'Smoke passed: static hit with ETag and 304, live render of a missing page, /__env.js, private settings, the coordinator, same-origin GraphQL and canonical IAM discovery. Interactive login, agent streaming and a guest navigation without /graphql requests still require a browser check.'
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
