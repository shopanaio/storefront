import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseEnv,
  validateRuntime,
  validateBackend,
  verifyHeadlessOAuth,
  hasReadyReplicas,
} from './deploy-theme.mjs';

test('Docker replica limits do not hide a converged stack', () => {
  assert.equal(
    hasReadyReplicas(
      'theme 2/2 (max 2 per node)\ncloudflared 2/2 (max 1 per node)'
    ),
    true
  );
  assert.equal(hasReadyReplicas('theme 2/2\ncloudflared 2/2'), true);
  assert.equal(
    hasReadyReplicas(
      'theme 1/2 (max 2 per node)\ncloudflared 2/2 (max 1 per node)'
    ),
    false
  );
  assert.equal(hasReadyReplicas('theme 2/2'), false);
});

const env = `THEME_IMAGE=ghcr.io/shopanaio/theme@sha256:${'a'.repeat(64)}
CLOUDFLARED_IMAGE=cloudflare/cloudflared:2026.10.2
BACKEND_NETWORK=shopana-stage-edge
TUNNEL_SECRET=theme-tunnel-v1
SERVER_ENV_SECRET=theme-runtime-v1
LAUNCHER_CONFIG=theme-launcher-abc`;
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
