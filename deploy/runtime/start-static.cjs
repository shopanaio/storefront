// Docker config of theme-static: the coordinator of the static site in the theme image. It
// renders the pages with the theme's own settings (the server env secret, as the theme reads
// them) and its own secrets (the static env secret), never in the image's layers.
const { readFileSync } = require('node:fs');
const { spawn } = require('node:child_process');

const read = (name) => JSON.parse(readFileSync(`/run/secrets/${name}`, 'utf8'));

// The theme's settings: what its server build renders the pages with. The read key of the
// bucket is the theme's; the coordinator writes with its own below.
for (const [key, value] of Object.entries(read('server-env'))) {
  if (typeof value !== 'string') {
    throw new Error(`Unsupported server setting: ${key}`);
  }
  if (key.startsWith('STOREFRONT_STATIC_S3_')) continue;
  process.env[key] = value;
}

const allowed = new Set([
  // The tokens of the API: the operator's, the servers' reports of hits.
  'STATIC_OPERATOR_TOKEN',
  'STOREFRONT_STATIC_COORDINATOR_TOKEN',
  // The private token of the Storefront API the renders ask with (the static site's alone).
  'STOREFRONT_PRIVATE_TOKEN',
  // The write key of the bucket: the pages, the snapshots of the index (__builder/).
  'STOREFRONT_STATIC_S3_ACCESS_KEY_ID',
  'STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY',
  // Step B: purges of the CDN tags of the pages a render changed.
  'CLOUDFLARE_PURGE_TOKEN',
]);
for (const [key, value] of Object.entries(read('static-env'))) {
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
  process.env.STOREFRONT_STATIC_STORE?.startsWith('s3://') &&
  !(
    process.env.STOREFRONT_STATIC_S3_ENDPOINT &&
    process.env.STOREFRONT_STATIC_S3_ACCESS_KEY_ID &&
    process.env.STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY
  )
) {
  throw new Error(
    'An s3:// STOREFRONT_STATIC_STORE needs STOREFRONT_STATIC_S3_ENDPOINT and its write key'
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
