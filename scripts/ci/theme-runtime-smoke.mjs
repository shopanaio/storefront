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
    const gatewayPort = 4320 + index;
    const gatewayRequests = [];
    const gateway = createServer((incoming, outgoing) => {
      gatewayRequests.push(incoming.headers);
      const upstream = request(
        {
          hostname: '127.0.0.1',
          port: 4105,
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
    proxies.push(gateway);
    await new Promise((done) => gateway.listen(gatewayPort, '0.0.0.0', done));
    const serverGraphqlUrl = `http://localhost:${gatewayPort}/graphql`;
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
      STOREFRONT_SERVER_GRAPHQL_URL: serverGraphqlUrl,
      NEXT_PUBLIC_API_KEY: key,
      NEXT_PUBLIC_CART_COOKIE_NAME: `runtime_${letter}`,
      IAM_OAUTH_CLIENT_SECRET: 'private-oauth-must-not-reach-html',
      STOREFRONT_SESSION_SECRET:
        'private-session-must-not-reach-html-0123456789',
    });
    await ready(`${origin}/__env.js`);
    // The public settings come from the server's environment, at /__env.js only.
    const env = await fetch(`${origin}/__env.js`);
    assert.equal(env.headers.get('cache-control'), 'no-cache');
    const context = {};
    runInNewContext(await env.text(), context);
    assert.equal(context.__shopanaPublicEnv.NEXT_PUBLIC_API_KEY, key);
    assert.equal(
      context.__shopanaPublicEnv.NEXT_PUBLIC_GRAPHQL_URL,
      `${origin}/graphql`
    );
    assert(
      !('STOREFRONT_SERVER_GRAPHQL_URL' in context.__shopanaPublicEnv),
      'Server address reached the public settings'
    );
    // The home page of the image's static site (build/static, rendered by the workflow).
    const home = await fetch(origin);
    assert.equal(home.headers.get('x-shopana-static'), 'hit');
    assert.equal(
      home.headers.get('cache-control'),
      'public, max-age=0, must-revalidate'
    );
    const staticHtml = await home.text();
    assert(
      staticHtml.includes('<script src="/__env.js">') &&
        !staticHtml.includes('__shopanaPublicEnv='),
      'The static page must load the public settings from /__env.js'
    );
    assert(
      !staticHtml.includes(serverGraphqlUrl) &&
        !staticHtml.includes('private-oauth-must-not-reach-html') &&
        !staticHtml.includes('private-session-must-not-reach-html'),
      'Private settings reached the static HTML'
    );
    // A page the image's static site has no file of: the server renders it.
    const response = await fetch(`${origin}/products/theme-smoke-missing`);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(response.headers.get('x-shopana-static'), 'miss');
    const html = await response.text();
    assert(
      !html.includes('__shopanaPublicEnv='),
      'Runtime settings must not be inline in the HTML'
    );
    const envScript = html.indexOf('<script src="/__env.js"></script>');
    assert(envScript !== -1, 'The HTML does not load /__env.js');
    assert(!html.includes(serverGraphqlUrl), 'Server address reached SSR HTML');
    assert(gatewayRequests.length > 0, 'SSR did not use the server address');
    gatewayRequests.length = 0;
    await fetch(`${origin}/products/theme-smoke-missing`, {
      headers: {
        'x-forwarded-for': '198.51.100.66, 203.0.113.7',
        'user-agent': 'theme-smoke-agent',
      },
    }).then((page) => page.text());
    const direct = gatewayRequests.find(
      (headers) => headers['user-agent'] === 'theme-smoke-agent'
    );
    assert(direct, 'SSR did not forward the visitor to the gateway');
    assert.equal(direct['x-forwarded-for'], '203.0.113.7, storefront-server');
    assert(!html.includes('private-oauth-must-not-reach-html'));
    assert(!html.includes('private-session-must-not-reach-html'));
    const moduleScript = html.search(/<script[^>]*type="module"/);
    assert(
      moduleScript === -1 || envScript < moduleScript,
      'Runtime settings must precede browser module execution'
    );
    console.log(
      `PASS: same image serves runtime key ${letter} and URL ${origin} from /__env.js with the image's static site; private settings stay server-side.`
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
