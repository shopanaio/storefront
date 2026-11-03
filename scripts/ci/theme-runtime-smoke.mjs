import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { createServer, request } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { runInNewContext } from 'node:vm';

// Linux CI: no real storefront credentials are involved in this isolated runtime test.
const image = process.env.IMAGE_REF;
assert(image, 'IMAGE_REF is required');
const prefix = `theme-smoke-${Date.now()}`;
const temp = mkdtempSync(join(tmpdir(), prefix));
const containers = [];
const proxies = [];
const docker = (...args) =>
  execFileSync('docker', args, { encoding: 'utf8' }).trim();

function start(name, mounts, env, command = []) {
  containers.push(name);
  const args = ['run', '-d', '--name', name, '--network', 'host'];
  for (const [source, target] of mounts) {
    args.push(
      '--mount',
      `type=bind,source=${source},target=${target},readonly`
    );
  }
  for (const [key, value] of Object.entries(env))
    args.push('-e', `${key}=${value}`);
  docker(...args, image, ...command);
}

async function ready(url) {
  let last;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.ok) return response;
      last = `HTTP ${response.status}`;
    } catch (error) {
      last = error.message;
    }
    await delay(1000);
  }
  throw new Error(`${url} did not become ready: ${last}`);
}

try {
  docker('pull', image);
  const mockScript = join(temp, 'mock.mjs');
  writeFileSync(
    mockScript,
    `
import { createMockServer } from '/app/mockServer/src/index.js';
import { fixtures } from '/app/test-fixtures/index.js';
const server = await createMockServer({ fixtures, publicPath: '/app/themes/brand-bite-crunch/.runtime/build/client' });
await server.listen({ host: '0.0.0.0', port: 4105 });
`,
    { mode: 0o644 }
  );
  start(
    `${prefix}-mock`,
    [
      [resolve('mockServer'), '/app/mockServer'],
      [resolve('themes/brand-bite-crunch/mock/fixtures'), '/app/test-fixtures'],
      [mockScript, '/app/mock.mjs'],
    ],
    {},
    ['node', '/app/mock.mjs']
  );
  await ready('http://127.0.0.1:4105/graphql?query=%7B__typename%7D');

  for (const [index, letter] of ['a', 'b'].entries()) {
    const publicPort = 4300 + index;
    const serverPort = 4310 + index;
    const origin = `http://127.0.0.1:${publicPort}`;
    const key = `shpna_sfpub_v1_${letter.repeat(22)}_${letter.repeat(43)}`;
    const proxy = createServer((incoming, outgoing) => {
      const port =
        incoming.url?.split('?')[0] === '/graphql' ? 4105 : serverPort;
      const upstream = request(
        {
          hostname: '127.0.0.1',
          port,
          path: incoming.url,
          method: incoming.method,
          headers: incoming.headers,
        },
        (response) => {
          outgoing.writeHead(response.statusCode, response.headers);
          response.pipe(outgoing);
        }
      );
      upstream.on('error', () => {
        outgoing.writeHead(502);
        outgoing.end();
      });
      incoming.pipe(upstream);
    });
    proxies.push(proxy);
    await new Promise((done) => proxy.listen(publicPort, '127.0.0.1', done));
    start(`${prefix}-${letter}`, [], {
      PORT: String(serverPort),
      NEXT_PUBLIC_APP_URL: origin,
      NEXT_PUBLIC_GRAPHQL_URL: `${origin}/graphql`,
      NEXT_PUBLIC_API_KEY: key,
      NEXT_PUBLIC_CART_COOKIE_NAME: `runtime_${letter}`,
      IAM_OAUTH_CLIENT_SECRET: 'private-oauth-must-not-reach-html',
      STOREFRONT_SESSION_SECRET:
        'private-session-must-not-reach-html-0123456789',
    });
    const response = await ready(origin);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    const html = await response.text();
    const config = html.match(
      /<script>globalThis\.__shopanaPublicEnv=([\s\S]*?)<\/script>/
    );
    assert(config, 'Runtime settings are missing from SSR HTML');
    const context = {};
    runInNewContext(`globalThis.__shopanaPublicEnv=${config[1]}`, context);
    assert.equal(context.__shopanaPublicEnv.NEXT_PUBLIC_API_KEY, key);
    assert.equal(
      context.__shopanaPublicEnv.NEXT_PUBLIC_GRAPHQL_URL,
      `${origin}/graphql`
    );
    assert(!html.includes('private-oauth-must-not-reach-html'));
    assert(!html.includes('private-session-must-not-reach-html'));
    const moduleScript = html.search(/<script[^>]*type="module"/);
    assert(
      moduleScript === -1 || config.index < moduleScript,
      'Runtime settings must precede browser module execution'
    );
    console.log(
      `PASS: same image serves runtime key ${letter} and URL ${origin}; private settings stay server-side.`
    );
  }
} catch (error) {
  for (const name of containers) {
    try {
      console.error(docker('logs', '--tail', '20', name));
    } catch {}
  }
  throw error;
} finally {
  for (const proxy of proxies) {
    proxy.closeAllConnections();
    proxy.close();
  }
  for (const name of containers) {
    try {
      docker('rm', '-f', name);
    } catch {}
  }
  rmSync(temp, { recursive: true, force: true });
}
