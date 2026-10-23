import { describe, expect, it } from 'vitest';
import { buildClosedPageRedirect } from './closedPageRedirect';

describe('buildClosedPageRedirect', () => {
  it('keeps the locale prefix of the request', () => {
    expect(
      buildClosedPageRedirect({ pathname: '/uk/account/orders', locale: 'uk' })
    ).toBe('/uk');
    expect(buildClosedPageRedirect({ pathname: '/uk', locale: 'uk' })).toBe('/uk');
  });

  it('goes to the root for an unprefixed request', () => {
    expect(
      buildClosedPageRedirect({ pathname: '/account', locale: 'en' })
    ).toBe('/');
    expect(
      buildClosedPageRedirect({ pathname: '/ukraine/account', locale: 'uk' })
    ).toBe('/');
  });

  it('carries over only a known sign-in result', () => {
    expect(
      buildClosedPageRedirect({
        pathname: '/uk/account',
        search: '?auth=failed&tab=orders',
        locale: 'uk',
      })
    ).toBe('/uk?auth=failed');
    expect(
      buildClosedPageRedirect({
        pathname: '/account',
        search: 'auth=%2F%2Fevil.example',
      })
    ).toBe('/');
  });
});
