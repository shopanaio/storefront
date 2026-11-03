import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { publicEnvironmentScript, PUBLIC_ENV_GLOBAL } from './public-env';

describe('public runtime environment', () => {
  it('publishes current runtime values while keeping server credentials private', () => {
    const render = (key: string) => {
      const script = publicEnvironmentScript({
        NEXT_PUBLIC_API_KEY: key,
        NEXT_PUBLIC_GRAPHQL_URL: 'https://pet.shopana.dev/graphql',
        IAM_OAUTH_CLIENT_SECRET: 'private-oauth-secret',
        STOREFRONT_SESSION_SECRET: 'private-session-secret',
        AWS_SECRET_ACCESS_KEY: 'private-storage-secret',
      });
      const context: Record<string, unknown> = {};
      runInNewContext(
        script.slice('<script>'.length, -'</script>'.length),
        context
      );
      return { script, values: context[PUBLIC_ENV_GLOBAL] };
    };
    const first = render('public-key-one');
    expect(first.values).toEqual({
      NEXT_PUBLIC_API_KEY: 'public-key-one',
      NEXT_PUBLIC_GRAPHQL_URL: 'https://pet.shopana.dev/graphql',
    });
    expect(first.script).not.toContain('private-');
    expect(render('public-key-two').values).toHaveProperty(
      'NEXT_PUBLIC_API_KEY',
      'public-key-two'
    );
  });

  it('cannot close the script through a public setting', () => {
    const script = publicEnvironmentScript({
      NEXT_PUBLIC_NAME: '</script><script>alert(1)</script>',
    });
    expect(script.match(/<script>/g)).toHaveLength(1);
    expect(script.match(/<\/script>/g)).toHaveLength(1);
    const context: Record<string, unknown> = {};
    runInNewContext(
      script.slice('<script>'.length, -'</script>'.length),
      context
    );
    expect(context[PUBLIC_ENV_GLOBAL]).toEqual({
      NEXT_PUBLIC_NAME: '</script><script>alert(1)</script>',
    });
  });
});
