import { describe, expect, it } from 'vitest';
import { createRuntimeRoot } from './root';

const root = createRuntimeRoot({
  app: {
    environmentConfig: {
      graphqlUrl: 'https://api.test/graphql',
      apiKeyHeader: 'x',
      apiKey: 'k',
    },
    routing: { localePrefix: 'as-needed' },
    cartConfig: { channelCode: 'online-store' },
  },
  layout: { default: ({ children }) => children },
  ErrorPage: () => null,
});

const revalidates = (
  from: string,
  to: string,
  extra: { formMethod?: 'POST'; defaultShouldRevalidate?: boolean } = {}
) =>
  root.shouldRevalidate({
    currentUrl: new URL(from, 'https://shop.test'),
    nextUrl: new URL(to, 'https://shop.test'),
    currentParams: {},
    nextParams: {},
    defaultShouldRevalidate: extra.defaultShouldRevalidate ?? true,
    formMethod: extra.formMethod,
  } as Parameters<typeof root.shouldRevalidate>[0]);

describe('the root revalidation', () => {
  it('keeps the root data between pages', () => {
    expect(revalidates('/', '/products/socks')).toBe(false);
  });

  it('loads it again after a submission and on router.refresh()', () => {
    expect(revalidates('/', '/cart', { formMethod: 'POST' })).toBe(true);
    expect(revalidates('/cart', '/cart')).toBe(true);
    expect(
      revalidates('/cart', '/cart', { defaultShouldRevalidate: false })
    ).toBe(false);
  });
});
