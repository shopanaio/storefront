import { describe, expect, it } from 'vitest';
import { ModuleRegistry } from './index';

const loader = async () => null;

describe('ModuleRegistry access', () => {
  it('closes the pages of a module that requires a session, except its public paths', () => {
    const registry = new ModuleRegistry();
    registry.register({
      type: 'page',
      slug: 'account',
      path: '/account{/*path}',
      access: { session: 'required', publicPaths: ['/account/reset-password'] },
      loader,
    });

    expect(registry.matchPath('page', '/account')?.requiresSession).toBe(true);
    expect(registry.matchPath('page', '/account/orders/1')?.requiresSession).toBe(
      true
    );
    expect(
      registry.matchPath('page', '/account/reset-password')?.requiresSession
    ).toBe(false);
  });

  it('keeps a module without access open', () => {
    const registry = new ModuleRegistry();
    registry.register({ type: 'page', slug: 'checkout', path: '/checkout', loader });

    expect(registry.matchPath('page', '/checkout')?.requiresSession).toBe(false);
  });

  it('refuses a closed module that matches the home page', () => {
    const registry = new ModuleRegistry();

    expect(() =>
      registry.register({
        type: 'page',
        slug: 'landing',
        path: '/',
        access: { session: 'required' },
        loader,
      })
    ).toThrow(/home page/);
  });
});
