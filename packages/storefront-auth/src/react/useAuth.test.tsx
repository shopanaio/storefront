import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sessionContext = vi.hoisted(() => ({
  sessionClient: { adopt: () => undefined },
  store: { getState: () => ({ setSignInPending: () => undefined }) },
  iamClient: null,
}));

vi.mock('@shopana/storefront-sdk/modules/session', () => ({
  storefrontSession: sessionContext.sessionClient,
  useSessionContext: () => sessionContext,
}));
vi.mock('@shopana/storefront-sdk/modules/session/react', () => ({
  useSessionContext: () => sessionContext,
}));

import { useAuth } from './useAuth';

const configuration = {
  methods: {
    password: { signIn: true, signUp: true, minLength: 8, maxLength: 128 },
    emailOtp: { signIn: true, signUp: false, codeLength: 6 },
    phoneOtp: { signIn: false, signUp: false, codeLength: 6 },
    social: [{ provider: 'google', signUp: true }],
  },
  emailVerificationRequired: false,
  emailVerificationMethod: 'otp',
  defaultLocale: 'uk',
};

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) =>
      url.endsWith('/configuration')
        ? Promise.resolve(
            new Response(JSON.stringify(configuration), {
              headers: { 'content-type': 'application/json' },
            })
          )
        : // The sign-in step never answers, as when the page leaves for a provider.
          new Promise<Response>(() => undefined)
    )
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useAuth', () => {
  it('releases a pending action when the page returns from the back/forward cache', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.status).toBe('ready'));

    act(() => {
      void result.current.password.signIn({
        email: 'buyer@example.test',
        password: 'correct horse',
      });
    });
    expect(result.current.isPending).toBe(true);

    act(() => {
      window.dispatchEvent(
        new PageTransitionEvent('pageshow', { persisted: true })
      );
    });
    expect(result.current.isPending).toBe(false);
  });
});
