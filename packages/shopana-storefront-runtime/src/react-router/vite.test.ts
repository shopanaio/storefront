import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@react-router/dev/vite', () => ({ reactRouter: () => [] }));
import { createRuntimeViteConfig } from './vite';

afterEach(() => vi.unstubAllEnvs());

describe('runtime public settings', () => {
  it('does not bake keys or URLs from the build machine into either bundle', () => {
    vi.stubEnv('NEXT_PUBLIC_API_KEY', 'build-key-must-not-be-inlined');
    vi.stubEnv('NEXT_PUBLIC_GRAPHQL_URL', 'https://build.example/graphql');
    const config = createRuntimeViteConfig()({
      mode: 'production',
      command: 'build',
    });
    expect(config.define ?? {}).not.toHaveProperty(
      'process.env.NEXT_PUBLIC_API_KEY'
    );
    expect(config.environments?.client.define?.['process.env']).toBe(
      'globalThis.__shopanaPublicEnv'
    );
    expect(JSON.stringify(config.define ?? {})).not.toContain(
      'build-key-must-not-be-inlined'
    );
    expect(JSON.stringify(config.environments)).not.toContain(
      'https://build.example'
    );
  });
});

it('replaces forwarded addresses with the direct peer in the dev server', async () => {
  const config = createRuntimeViteConfig()({
    mode: 'development',
    command: 'serve',
  });
  const plugins = await Promise.all(config.plugins ?? []);
  const plugin = plugins
    .flat(Infinity)
    .find((item: any) => item?.name === 'shopana-dev-client-address') as any;
  let middleware: any;
  plugin.configureServer({
    middlewares: {
      use: (handler: any) => {
        middleware = handler;
      },
    },
  });
  const request = {
    headers: {
      'x-forwarded-for': '203.0.113.99',
      'x-real-ip': '203.0.113.99',
    } as Record<string, string>,
    socket: { remoteAddress: '127.0.0.1' },
  };
  const next = vi.fn();
  middleware(request, {}, next);
  expect(request.headers).toEqual({ 'x-forwarded-for': '127.0.0.1' });
  expect(next).toHaveBeenCalledOnce();
  const build = createRuntimeViteConfig()({
    mode: 'production',
    command: 'build',
  });
  expect(JSON.stringify(build.plugins)).not.toContain(
    'shopana-dev-client-address'
  );
});
