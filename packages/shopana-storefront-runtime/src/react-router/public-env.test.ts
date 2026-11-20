import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { publicEnvironmentSource, PUBLIC_ENV_GLOBAL } from './public-env';

function run(source: string): unknown {
  const context: Record<string, unknown> = {};
  runInNewContext(source, context);
  return context[PUBLIC_ENV_GLOBAL];
}

describe('public runtime environment', () => {
  it('publishes current runtime values while keeping server credentials private', () => {
    const render = (key: string) => {
      const source = publicEnvironmentSource({
        NEXT_PUBLIC_API_KEY: key,
        NEXT_PUBLIC_GRAPHQL_URL: 'https://pet.shopana.dev/graphql',
        IAM_OAUTH_CLIENT_SECRET: 'private-oauth-secret',
        STOREFRONT_SESSION_SECRET: 'private-session-secret',
        STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY: 'private-storage-secret',
        STOREFRONT_SERVER_GRAPHQL_URL: 'http://gateway.internal:4000/graphql',
      });
      return { source, values: run(source) };
    };
    const first = render('public-key-one');
    expect(first.values).toEqual({
      NEXT_PUBLIC_API_KEY: 'public-key-one',
      NEXT_PUBLIC_GRAPHQL_URL: 'https://pet.shopana.dev/graphql',
    });
    expect(first.source).not.toContain('private-');
    expect(first.source).not.toContain('gateway.internal');
    expect(render('public-key-two').values).toHaveProperty(
      'NEXT_PUBLIC_API_KEY',
      'public-key-two'
    );
  });

  it('cannot close a script through a public setting', () => {
    const source = publicEnvironmentSource({
      NEXT_PUBLIC_NAME: '</script><script>alert(1)</script>',
    });
    expect(source).not.toContain('</script>');
    expect(run(source)).toEqual({
      NEXT_PUBLIC_NAME: '</script><script>alert(1)</script>',
    });
  });
});
