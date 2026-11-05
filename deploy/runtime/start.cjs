// Docker config mounted into the existing theme image; secrets never enter its layers.
const { readFileSync } = require('node:fs');
const { spawn } = require('node:child_process');

const values = JSON.parse(readFileSync('/run/secrets/server-env', 'utf8'));
const allowed = new Set([
  'NEXT_PUBLIC_API_KEY',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_GRAPHQL_URL',
  'STOREFRONT_SERVER_GRAPHQL_URL',
  'NEXT_PUBLIC_PET_ASSISTANT_URL',
  'NEXT_PUBLIC_IAM_URL',
  'NEXT_PUBLIC_IAM_APPLICATION_ID',
  'NEXT_PUBLIC_CART_COOKIE_NAME',
  'NEXT_PUBLIC_STOREFRONT_COOKIE_POLICY',
  'STOREFRONT_SESSION_SECRET',
  'STOREFRONT_COOKIE_POLICY',
  'STOREFRONT_TRUSTED_PROXY_HOPS',
  'IAM_OAUTH_CLIENT_ID',
  'IAM_OAUTH_CLIENT_SECRET',
  'IAM_OAUTH_RESOURCE',
  'IAM_OAUTH_REDIRECT_URI',
  'IAM_OAUTH_POST_LOGOUT_REDIRECT_URI',
]);
for (const [key, value] of Object.entries(values)) {
  if (!allowed.has(key) || typeof value !== 'string') {
    throw new Error(`Unsupported server setting: ${key}`);
  }
  process.env[key] = value;
}
if (
  !/^shpna_sfpub_v1_[A-Za-z0-9_-]{22}_[A-Za-z0-9_-]{43}$/.test(
    process.env.NEXT_PUBLIC_API_KEY ?? ''
  )
) {
  throw new Error(
    'NEXT_PUBLIC_API_KEY must contain a PUBLIC Headless access token'
  );
}
for (const key of ['NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_GRAPHQL_URL']) {
  if (!process.env[key]) throw new Error(`${key} is required at runtime`);
}
if (
  process.env.STOREFRONT_SERVER_GRAPHQL_URL &&
  !/^https?:\/\/[^/\s]+\/\S*$/.test(process.env.STOREFRONT_SERVER_GRAPHQL_URL)
) {
  throw new Error('STOREFRONT_SERVER_GRAPHQL_URL must be an absolute HTTP URL');
}
if ((process.env.STOREFRONT_SESSION_SECRET?.length ?? 0) < 32) {
  throw new Error(
    'STOREFRONT_SESSION_SECRET must contain at least 32 characters'
  );
}
const child = spawn(
  process.execPath,
  ['/app/node_modules/@react-router/serve/bin.cjs', 'build/server/index.js'],
  { stdio: 'inherit', env: process.env }
);
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, () => child.kill(signal));
}
child.once('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.once('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
