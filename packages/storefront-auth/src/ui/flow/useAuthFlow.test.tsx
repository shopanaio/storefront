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
  useUser: () => null,
  useLoginMethod: () => null,
  useSessionExpired: () => false,
  useAuthResult: () => ({ result: null, clear: () => undefined }),
  useIsAuthenticated: () => false,
  useSessionStatus: () => 'anonymous',
  useSignInPending: () => false,
  useSignOut: () => () => undefined,
}));

import { useAuthFlow } from './useAuthFlow';

const configuration = {
  methods: {
    password: {
      signIn: true,
      signUp: true,
      reset: true,
      minLength: 8,
      maxLength: 128,
    },
    emailOtp: { signIn: true, signUp: true, codeLength: 6 },
    phoneOtp: { signIn: false, signUp: false, codeLength: 6 },
    social: [],
  },
  emailVerificationRequired: true,
  emailVerificationMethod: 'otp',
  defaultLocale: 'uk',
};

const json = (body: unknown, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    })
  );

const fetchMock = vi.fn((url: string, init?: RequestInit) => {
  void init;
  if (url.endsWith('/configuration')) return json(configuration);
  if (url.endsWith('/password-sign-up'))
    return json({ type: 'verificationRequired', method: 'otp' });
  // A spent transaction (a parallel tab finished it).
  if (url.endsWith('/password-sign-in'))
    return json({ error: 'expired', message: 'spent' }, 409);
  if (url.endsWith('/email-otp-send'))
    return json({
      type: 'otpSent',
      channel: 'email',
      resendAfter: 60,
      expiresIn: 600,
    });
  return json({ error: 'unavailable', message: 'unexpected' }, 500);
});

const bodyOf = (action: string) => {
  const call = fetchMock.mock.calls.find(([url]) => url.endsWith(`/${action}`));
  return call
    ? (JSON.parse(String(call[1]?.body)) as Record<string, unknown>)
    : undefined;
};

beforeEach(() => {
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useAuthFlow', () => {
  it('sends the verification code to the email the buyer signed up with', async () => {
    // The draft still has the email of the checkout contact; the buyer signs up with another.
    const { result } = renderHook(() =>
      useAuthFlow({
        initialScreen: 'signUp',
        defaultIdentifier: { email: 'contact@example.test' },
      })
    );
    await waitFor(() => expect(result.current.view.name).toBe('signUp'));

    const view = result.current.view;
    if (view.name !== 'signUp') throw new Error('not the sign-up screen');
    act(() => {
      view.props.onSubmit({
        firstName: 'Olena',
        lastName: 'Kovalenko',
        email: 'new@example.test',
        password: 'correct horse',
      });
    });

    await waitFor(() => expect(result.current.view.name).toBe('code'));
    expect(bodyOf('password-sign-up')).toMatchObject({
      email: 'new@example.test',
    });
    expect(bodyOf('email-otp-send')).toEqual({ email: 'new@example.test' });
    const code = result.current.view;
    if (code.name !== 'code') throw new Error('not the code screen');
    expect(code.props.purpose).toBe('verifyEmail');
    expect(code.props.destination).toBe('new@example.test');
  });

  it('starts over on the first screen when a step expired', async () => {
    const { result } = renderHook(() =>
      useAuthFlow({ initialScreen: 'password' })
    );
    await waitFor(() => expect(result.current.view.name).toBe('password'));

    const view = result.current.view;
    if (view.name !== 'password') throw new Error('not the password screen');
    act(() => {
      view.props.onSubmit({
        email: 'buyer@example.test',
        password: 'correct horse',
      });
    });

    await waitFor(() => expect(result.current.view.name).toBe('identify'));
    expect(result.current.navigation.canGoBack).toBe(false);
  });
});
