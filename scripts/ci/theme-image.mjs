import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

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
const tag = `sha-${themeSha}-sdk-${storefrontSha}`;
for (const [key, value] of Object.entries({
  image,
  tag,
  theme_sha: themeSha,
  storefront_sha: storefrontSha,
})) {
  appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}
