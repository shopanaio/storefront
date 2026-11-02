// Docker config mounted into the existing theme image; secrets never enter its layers.
const { readFileSync } = require('node:fs');
const { spawn } = require('node:child_process');

const values = JSON.parse(readFileSync('/run/secrets/server-env', 'utf8'));
const allowed = new Set([
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
if ((process.env.STOREFRONT_SESSION_SECRET?.length ?? 0) < 32) {
  throw new Error('STOREFRONT_SESSION_SECRET must contain at least 32 characters');
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
