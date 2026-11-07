// Docker config of theme-static: the coordinator of the static site in the theme image, its
// secrets from the static env secret (a JSON object), never in the image's layers.
const { readFileSync } = require('node:fs');
const { spawn } = require('node:child_process');

const values = JSON.parse(readFileSync('/run/secrets/static-env', 'utf8'));
const allowed = new Set([
  // The service user of the event feed.
  'SHOPANA_EVENTS_REFRESH_TOKEN',
  // The tokens of the API: the operator's, the servers' reports of hits.
  'STATIC_OPERATOR_TOKEN',
  'STOREFRONT_STATIC_COORDINATOR_TOKEN',
  // The private key (PEM) of the GitHub App shopana-static-dispatch.
  'STATIC_GITHUB_APP_PRIVATE_KEY',
  // The key of the bucket for the snapshots of the index (__builder/).
  'STOREFRONT_STATIC_S3_ACCESS_KEY_ID',
  'STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY',
  // Step B: purges of CDN tags.
  'CLOUDFLARE_PURGE_TOKEN',
]);
for (const [key, value] of Object.entries(values)) {
  if (!allowed.has(key) || typeof value !== 'string') {
    throw new Error(`Unsupported coordinator setting: ${key}`);
  }
  process.env[key] = value;
}
for (const key of [
  'STATIC_OPERATOR_TOKEN',
  'STOREFRONT_STATIC_COORDINATOR_TOKEN',
]) {
  if ((process.env[key]?.length ?? 0) < 32) {
    throw new Error(`${key} must contain at least 32 characters`);
  }
}
if (
  process.env.STATIC_INDEX_STORE?.startsWith('s3://') &&
  !(
    process.env.STOREFRONT_STATIC_S3_ENDPOINT &&
    process.env.STOREFRONT_STATIC_S3_ACCESS_KEY_ID &&
    process.env.STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY
  )
) {
  throw new Error(
    'An s3:// STATIC_INDEX_STORE needs STOREFRONT_STATIC_S3_ENDPOINT and its key'
  );
}
const child = spawn(
  process.execPath,
  [
    '/app/packages/shopana-storefront-runtime/bin/storefront-runtime.js',
    'static',
    'coordinator',
    '--port',
    '3100',
    '--data',
    process.env.STATIC_DATA_DIR || '/data',
  ],
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
