import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseEnv,
  requestFullBuild,
  smoke,
  validateStaticEnv,
  validateRuntime,
  validateBackend,
  verifyHeadlessOAuth,
} from './deploy-theme.mjs';

const env = `THEME_IMAGE=ghcr.io/shopanaio/theme@sha256:${'a'.repeat(64)}
CLOUDFLARED_IMAGE=cloudflare/cloudflared:2026.10.2
BACKEND_NETWORK=shopana-stage-edge
TUNNEL_SECRET=theme-tunnel-v1
SERVER_ENV_SECRET=theme-runtime-v1
LAUNCHER_CONFIG=theme-launcher-abc
STATIC_ENV_SECRET=theme-static-v1`;
const outputs = {
  app_url: 'https://pet.shopana.dev',
  graphql_url: 'https://pet.shopana.dev/graphql',
  iam_url: 'https://auth.shopana.dev',
  pet_assistant_url: 'https://pet.shopana.dev/apps/pet-assistant/v1',
};
const values = {
  NEXT_PUBLIC_API_KEY: `shpna_sfpub_v1_${'a'.repeat(22)}_${'b'.repeat(43)}`,
  NEXT_PUBLIC_APP_URL: outputs.app_url,
  NEXT_PUBLIC_GRAPHQL_URL: outputs.graphql_url,
  NEXT_PUBLIC_IAM_URL: outputs.iam_url,
  NEXT_PUBLIC_PET_ASSISTANT_URL: outputs.pet_assistant_url,
  STOREFRONT_SESSION_SECRET: 'private-session-value-01234567890123456789',
  STOREFRONT_TRUSTED_PROXY_HOPS: '1',
  NEXT_PUBLIC_IAM_APPLICATION_ID: 'application',
  IAM_OAUTH_CLIENT_ID: 'client',
  IAM_OAUTH_CLIENT_SECRET: 'private-client-secret',
  IAM_OAUTH_RESOURCE: 'resource',
  IAM_OAUTH_REDIRECT_URI: `${outputs.app_url}/auth/callback`,
  IAM_OAUTH_POST_LOGOUT_REDIRECT_URI: `${outputs.app_url}/`,
};
const service = (...entries) => ({
  Spec: {
    TaskTemplate: {
      Networks: [{ Target: 'edge-id' }],
      ContainerSpec: { Env: entries },
    },
  },
});

test('deploy inputs reject shell expansion, unknown and duplicate assignments', () => {
  assert.equal(parseEnv(env).BACKEND_NETWORK, 'shopana-stage-edge');
  for (const line of [
    'THEME_IMAGE=$(cat /secret)',
    'UNEXPECTED=value',
    'BACKEND_NETWORK=other',
  ]) {
    assert.throws(() => parseEnv(`${env}\n${line}`), /assignment/);
  }
  assert.throws(
    () => parseEnv(env.replace(/@sha256:[a-f0-9]+/, ':latest')),
    /immutable/
  );
});

test('valid same-origin runtime settings pass', () =>
  validateRuntime(values, outputs));

test('private Headless tokens and incomplete OAuth settings are rejected without exposing values', () => {
  assert.throws(
    () =>
      validateRuntime(
        { ...values, NEXT_PUBLIC_API_KEY: 'shpna_private_secret' },
        outputs
      ),
    (error) =>
      error.message.includes('PUBLIC Headless') &&
      !error.message.includes('shpna_private_secret')
  );
  assert.throws(
    () => validateRuntime({ ...values, IAM_OAUTH_CLIENT_SECRET: '' }, outputs),
    /IAM_OAUTH_CLIENT_SECRET/
  );
});

test('runtime URLs match Terraform and OAuth callbacks use HTTPS', () => {
  assert.throws(
    () =>
      validateRuntime(
        {
          ...values,
          NEXT_PUBLIC_GRAPHQL_URL: 'https://api.shopana.dev/graphql',
        },
        outputs
      ),
    /Terraform/
  );
  assert.throws(
    () =>
      validateRuntime(
        {
          ...values,
          IAM_OAUTH_REDIRECT_URI: 'http://other.test/auth/callback',
        },
        outputs
      ),
    /HTTPS callback/
  );
});

test('the server GraphQL address is optional and must be an HTTP URL', () => {
  validateRuntime(
    {
      ...values,
      STOREFRONT_SERVER_GRAPHQL_URL: 'http://gateway-storefront:4000/graphql',
    },
    outputs
  );
  assert.throws(
    () =>
      validateRuntime(
        { ...values, STOREFRONT_SERVER_GRAPHQL_URL: 'gateway-storefront:4000' },
        outputs
      ),
    /STOREFRONT_SERVER_GRAPHQL_URL/
  );
});

test('existing two-hop backend and canonical IAM pass; a direct one-hop gateway is rejected', () => {
  validateBackend(
    service('STOREFRONT_TRUSTED_PROXY_HOPS=2'),
    service(`IAM_PUBLIC_BASE_URL=${outputs.iam_url}`),
    service(),
    'edge-id',
    values
  );
  assert.throws(
    () =>
      validateBackend(
        service('STOREFRONT_TRUSTED_PROXY_HOPS=1'),
        service(`IAM_PUBLIC_BASE_URL=${outputs.iam_url}`),
        service(),
        'edge-id',
        values
      ),
    /two proxy hops/
  );
});

test('mismatching IAM issuer and disconnected Traefik are blocked', () => {
  const gateway = service('STOREFRONT_TRUSTED_PROXY_HOPS=2');
  assert.throws(
    () =>
      validateBackend(
        gateway,
        service('IAM_PUBLIC_BASE_URL=https://other.test'),
        service(),
        'edge-id',
        values
      ),
    /canonical IAM/
  );
  assert.throws(
    () =>
      validateBackend(gateway, service(), service(), 'another-network', values),
    /overlay/
  );
  const traefik = service();
  traefik.Spec.TaskTemplate.Networks = [];
  assert.throws(
    () => validateBackend(gateway, service(), traefik, 'edge-id', values),
    /traefik.*overlay/
  );
});

test('headless sign-in uses the registered callback independently from the theme origin', async () => {
  const headless = {
    ...values,
    IAM_OAUTH_REDIRECT_URI: 'https://registered.test/auth/callback',
    IAM_OAUTH_POST_LOGOUT_REDIRECT_URI: '',
  };
  validateRuntime(headless, outputs);
  await verifyHeadlessOAuth(headless, async () =>
    Response.json({ methods: { social: [] } })
  );
  await assert.rejects(
    verifyHeadlessOAuth(headless, async () =>
      Response.json({ methods: { social: [{ provider: 'google' }] } })
    ),
    /Social sign-in/
  );
  await assert.rejects(
    verifyHeadlessOAuth(
      headless,
      async () => new Response(null, { status: 401 })
    ),
    /HTTP 401/
  );
});

test('deploy inputs take the static site bucket, well formed', () => {
  const withBucket = `${env}\nSTATIC_STORE=s3://shopana-storefront-static-stage/site\nSTATIC_ENDPOINT=https://account.r2.cloudflarestorage.com`;
  assert.equal(
    parseEnv(withBucket).STATIC_STORE,
    's3://shopana-storefront-static-stage/site'
  );
  assert.throws(
    () =>
      parseEnv(
        `${env}\nSTATIC_STORE=s3://shopana-storefront-static-stage/site`
      ),
    /STATIC_ENDPOINT/
  );
  assert.throws(
    () =>
      parseEnv(
        `${env}\nSTATIC_STORE=fs:/tmp\nSTATIC_ENDPOINT=https://r2.example`
      ),
    /s3:\/\//
  );
  assert.equal(parseEnv(env).STATIC_STORE, '');
  assert.throws(
    () => parseEnv(`${env}\nSTATIC_ENDPOINT=https://r2.example`),
    /set both or neither/
  );
});

test('the smoke wants a static hit, its 304, a live miss and /__env.js', async () => {
  const etag = '"abc"';
  const staticHtml =
    '<html><head><script src="/__env.js"></script><script>window.__shopanaStatic={}</script></head></html>';
  const site =
    (overrides = {}) =>
    async (url, init = {}) => {
      const { pathname } = new URL(url);
      const headers = init.headers ?? {};
      if (pathname in overrides) return overrides[pathname]();
      if (pathname === '/__env.js') {
        return new Response(
          `globalThis.__shopanaPublicEnv={"NEXT_PUBLIC_API_KEY":"${values.NEXT_PUBLIC_API_KEY}"};`,
          { headers: { 'cache-control': 'no-cache' } }
        );
      }
      if (pathname === '/') {
        if (headers['if-none-match'] === etag)
          return new Response(null, { status: 304 });
        return new Response(staticHtml, {
          headers: {
            'content-type': 'text/html',
            'x-shopana-static': 'hit',
            'cache-control': 'public, max-age=0, must-revalidate',
            etag,
          },
        });
      }
      if (pathname.startsWith('/products/smoke-')) {
        return new Response('<script src="/__env.js"></script>', {
          status: 404,
          headers: {
            'x-shopana-static': 'miss',
            'cache-control': 'private, no-store',
          },
        });
      }
      if (pathname === '/graphql')
        return Response.json({ data: { __typename: 'Query' } });
      if (pathname === '/__builder/api/health')
        return Response.json({ ok: true });
      const path = `/auth/applications/${values.NEXT_PUBLIC_IAM_APPLICATION_ID}`;
      return Response.json({ issuer: `${values.NEXT_PUBLIC_IAM_URL}${path}` });
    };
  await smoke(values, site());
  await assert.rejects(
    smoke(
      values,
      site({
        '/': () =>
          new Response(staticHtml, {
            headers: {
              'content-type': 'text/html',
              'x-shopana-static': 'miss',
            },
          }),
      })
    ),
    /x-shopana-static: hit/
  );
  await assert.rejects(
    smoke(
      values,
      site({
        '/__env.js': () =>
          new Response(
            values.STOREFRONT_SESSION_SECRET + values.NEXT_PUBLIC_API_KEY,
            {
              headers: { 'cache-control': 'no-cache' },
            }
          ),
      })
    ),
    /leaked into \/__env\.js/
  );
});

test('the coordinator secret holds known keys and the token of the theme', () => {
  const token = 't'.repeat(40);
  const staticValues = {
    STATIC_OPERATOR_TOKEN: 'o'.repeat(40),
    STOREFRONT_STATIC_COORDINATOR_TOKEN: token,
    SHOPANA_EVENTS_REFRESH_TOKEN: 'refresh',
  };
  validateStaticEnv(staticValues, {
    ...values,
    STOREFRONT_STATIC_COORDINATOR_TOKEN: token,
  });
  assert.throws(
    () => validateStaticEnv(staticValues, values),
    /must be the same/
  );
  assert.throws(
    () =>
      validateStaticEnv(
        { ...staticValues, OTHER: 'x' },
        {
          ...values,
          STOREFRONT_STATIC_COORDINATOR_TOKEN: token,
        }
      ),
    /Unsupported/
  );
  assert.throws(
    () =>
      validateStaticEnv(
        { ...staticValues, STATIC_OPERATOR_TOKEN: 'short' },
        { ...values, STOREFRONT_STATIC_COORDINATOR_TOKEN: token }
      ),
    /32 characters/
  );
  assert.throws(
    () => parseEnv(env.replace(/\nSTATIC_ENV_SECRET=.*/, '')),
    /STATIC_ENV_SECRET/
  );
});

test('a new image asks the coordinator for a full build', async () => {
  const calls = [];
  const requestId = await requestFullBuild(
    'https://pet.shopana.dev',
    'operator',
    'ghcr.io/x@sha256:1',
    async (url, init) => {
      calls.push({ url: String(url), init });
      return Response.json({ requestId: 'b-1' }, { status: 202 });
    }
  );
  assert.equal(requestId, 'b-1');
  assert.equal(calls[0].url, 'https://pet.shopana.dev/__builder/api/builds');
  assert.equal(calls[0].init.headers.authorization, 'Bearer operator');
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    mode: 'full',
    image: 'ghcr.io/x@sha256:1',
    reason: 'deploy',
  });
});
