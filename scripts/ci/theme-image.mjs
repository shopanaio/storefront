import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const environment = process.env.RELEASE_ENVIRONMENT;
assert(
  ['stage', 'production'].includes(environment),
  'Select stage or production'
);
const app = new URL(
  process.env.APP_URL ||
    (environment === 'stage' ? 'https://pet.shopana.dev' : '')
);
assert(app.protocol === 'https:', 'The app URL must use HTTPS');
assert(
  app.pathname === '/' &&
    !app.search &&
    !app.hash &&
    !app.username &&
    !app.password,
  'The app URL must contain only the origin'
);

const apiKey = process.env.PUBLIC_API_KEY;
assert(
  /^shpna_sfpub_v1_[A-Za-z0-9_-]{22}_[A-Za-z0-9_-]{43}$/.test(apiKey ?? ''),
  'SHOPANA_API_KEY must contain a PUBLIC Headless access token'
);
const iamId = process.env.IAM_APPLICATION_ID || '';
const cookieName =
  process.env.CART_COOKIE_NAME || `shopana_cart_${environment}`;
const cookiePolicy = process.env.COOKIE_POLICY || 'first-party';
assert(/^[A-Za-z0-9_-]+$/.test(cookieName), 'Invalid cart cookie name');
assert(
  ['first-party', 'embedded'].includes(cookiePolicy),
  'Invalid cookie policy'
);

function sameOrigin(value, fallback, pathname) {
  const url = new URL(value || fallback);
  assert(
    url.origin === app.origin,
    'API, agent and IAM must share the app origin'
  );
  assert(
    !url.username && !url.password && !url.search && !url.hash,
    'Invalid service URL'
  );
  assert(url.pathname.replace(/\/$/, '') === pathname, 'Invalid service path');
  return `${url.origin}${pathname}`;
}

const publicEnv = {
  STOREFRONT_THEME: 'brand-bite-crunch',
  NEXT_PUBLIC_APP_URL: app.origin,
  NEXT_PUBLIC_GRAPHQL_URL: sameOrigin(
    process.env.GRAPHQL_URL,
    `${app.origin}/graphql`,
    '/graphql'
  ),
  NEXT_PUBLIC_API_KEY: apiKey,
  NEXT_PUBLIC_PET_ASSISTANT_URL: sameOrigin(
    process.env.ASSISTANT_URL,
    `${app.origin}/apps/pet-assistant/v1`,
    '/apps/pet-assistant/v1'
  ),
  NEXT_PUBLIC_IAM_URL: iamId
    ? sameOrigin(process.env.IAM_URL, app.origin, '')
    : '',
  NEXT_PUBLIC_IAM_APPLICATION_ID: iamId,
  NEXT_PUBLIC_CART_COOKIE_NAME: cookieName,
  NEXT_PUBLIC_STOREFRONT_COOKIE_POLICY: cookiePolicy,
};
for (const [key, value] of Object.entries(publicEnv)) {
  assert(!/[\r\n]/.test(value), `Multiline value is not allowed for ${key}`);
  appendFileSync(process.env.GITHUB_ENV, `${key}=${value}\n`);
}

const storefrontSha = execFileSync('git', ['rev-parse', 'HEAD'], {
  encoding: 'utf8',
}).trim();
const themeSha = execFileSync(
  'git',
  ['-C', 'themes/brand-bite-crunch', 'rev-parse', 'HEAD'],
  {
    encoding: 'utf8',
  }
).trim();
assert(
  themeSha === process.env.GITHUB_SHA,
  'Theme checkout must match the workflow commit'
);
const image = `ghcr.io/${process.env.GITHUB_REPOSITORY.toLowerCase()}/theme`;
const tag = `${environment}-sha-${themeSha}-sdk-${storefrontSha}`;
for (const [key, value] of Object.entries({
  image,
  tag,
  theme_sha: themeSha,
  storefront_sha: storefrontSha,
})) {
  appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}
