'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { AuthError } from '../core/AuthError';
import type {
  AuthConfiguration,
  AuthMethods,
  AuthStep,
  OtpChannel,
} from '../core/types';
import type {
  AuthFlowStep,
  AuthOutcome,
  OtpActions,
  UseAuthResult,
} from '../react/useAuth';
import { useSecondsUntil } from '../react/useSecondsUntil';
import {
  configurationOf,
  MOCK_CODE,
  MOCK_METHODS,
  WRONG_PASSWORD,
} from './fixtures';

export interface MockAuthOptions {
  /** Methods of the store over `MOCK_METHODS` (everything enabled). */
  methods?: Partial<AuthMethods>;
  /** The configuration is ready, still loading, or could not be read. */
  status?: UseAuthResult['status'];
  /** How long a step takes; 500 ms by default, 0 in a test. */
  latencyMs?: number;
  /** Seconds until a code can be sent again; 42 by default. */
  resendAfter?: number;
  /**
   * A step signed the buyer in: `email` (a password, an email code) or `phone` (an SMS code),
   * with the destination the buyer typed. The host signs its own session in here.
   */
  onSignedIn?: (method: OtpChannel, destination: string | undefined) => void;
}

export interface MockAuthState {
  step: AuthFlowStep;
  error: AuthError | null;
  isPending: boolean;
}

export interface MockAuth {
  /**
   * A `useAuth()` that answers like IAM: give it to the mock of the hook (Storybook's
   * `mocked(useAuth).mockImplementation(auth.useAuth)`, vitest's `vi.mocked(...)`).
   */
  useAuth: () => UseAuthResult;
  configuration: AuthConfiguration;
  /** Puts the sign-in in a state, e.g. an error the story shows. */
  set: (state: Partial<MockAuthState>) => void;
  /** The current state, outside React. */
  get: () => MockAuthState;
  /** Back to the method forms, without an error. */
  reset: () => void;
  /** Where the last code, link or password step went. */
  destinations: { email?: string; phone?: string };
}

const IDLE: MockAuthState = {
  step: { type: 'idle' },
  error: null,
  isPending: false,
};

/**
 * The headless sign-in without a server, for stories and tests: the email or SMS code is
 * `MOCK_CODE`, any password but `WRONG_PASSWORD` signs in, a sign-up signs in at once, and a
 * social provider never answers (the page would leave). Each call makes its own state.
 */
export function createMockAuth({
  methods: methodsOverride,
  status = 'ready',
  latencyMs = 500,
  resendAfter = 42,
  onSignedIn,
}: MockAuthOptions = {}): MockAuth {
  const methods: AuthMethods = { ...MOCK_METHODS, ...methodsOverride };
  const configuration = configurationOf(methods);
  const destinations: MockAuth['destinations'] = {};

  let state = IDLE;
  const listeners = new Set<() => void>();
  const set = (next: Partial<MockAuthState>) => {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  };
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const wait = () =>
    latencyMs > 0
      ? new Promise((resolve) => setTimeout(resolve, latencyMs))
      : Promise.resolve();

  /** Runs a step like the real hook: pending, then the step or the error. */
  const run = async (
    answer: () => AuthStep | AuthError,
    toStep: (step: AuthStep) => AuthFlowStep
  ): Promise<AuthOutcome> => {
    set({ isPending: true, error: null });
    await wait();
    const result = answer();
    if (result instanceof AuthError) {
      set({ isPending: false, error: result });
      return result;
    }
    set({ isPending: false, step: toStep(result) });
    return result;
  };

  const completed = (method: OtpChannel): AuthStep => {
    onSignedIn?.(method, destinations[method]);
    return { type: 'completed' } as AuthStep;
  };

  const otp = (channel: OtpChannel): OtpActions => {
    const send = (destination?: string) => {
      const target = destination ?? destinations[channel] ?? '';
      destinations[channel] = target;
      return run(
        () => ({ type: 'otpSent', channel, resendAfter, expiresIn: 600 }),
        () => ({
          type: 'otpSent',
          channel,
          destination: target,
          resendIn: resendAfter,
          resendAt: Date.now() + resendAfter * 1000,
          expiresAt: Date.now() + 600_000,
        })
      );
    };
    return {
      send,
      resend: () => send(),
      verify: (code) =>
        run(
          () =>
            code === MOCK_CODE
              ? completed(channel)
              : new AuthError('invalidCredentials', 'Wrong code', 400),
          () => ({ type: 'completed' })
        ),
    };
  };

  const actions: Omit<UseAuthResult, 'step' | 'error' | 'isPending'> = {
    status,
    configuration: status === 'ready' ? configuration : null,
    methods: status === 'ready' ? methods : null,
    emailOtp: otp('email'),
    phoneOtp: otp('phone'),
    password: {
      signIn: (input) => {
        destinations.email = input.email;
        return run(
          () =>
            input.password === WRONG_PASSWORD
              ? new AuthError('invalidCredentials', 'Wrong password', 400)
              : completed('email'),
          () => ({ type: 'completed' })
        );
      },
      signUp: (input) => {
        destinations.email = input.email;
        return run(
          () => completed('email'),
          () => ({ type: 'completed' })
        );
      },
      forgot: (email) => {
        destinations.email = email;
        return run(
          () => ({ type: 'resetLinkSent' }),
          () => ({ type: 'resetLinkSent', email })
        );
      },
      reset: () =>
        run(
          () => ({ type: 'passwordReset' }),
          () => ({ type: 'passwordReset' })
        ),
    },
    emailVerification: {
      resend: (email) => {
        const target = email ?? destinations.email ?? '';
        destinations.email = target;
        return run(
          () => ({ type: 'verificationSent' }),
          () => ({ type: 'verificationSent', email: target })
        );
      },
    },
    social: {
      // The browser would leave for the provider here: the step never ends.
      start: async () => {
        set({ isPending: true, error: null });
        await new Promise(() => undefined);
      },
    },
    reset: () => set({ step: { type: 'idle' }, error: null }),
    reloadConfiguration: () => undefined,
  };

  function useMockAuth(): UseAuthResult {
    const current = useSyncExternalStore(
      subscribe,
      () => state,
      () => state
    );
    const { step } = current;
    const resendIn = useSecondsUntil(
      step.type === 'otpSent' ? step.resendAt : null
    );
    return useMemo(
      () => ({
        ...actions,
        step: step.type === 'otpSent' ? { ...step, resendIn } : step,
        error: current.error,
        isPending: current.isPending,
      }),
      [current, step, resendIn]
    );
  }

  return {
    useAuth: useMockAuth,
    configuration,
    set,
    get: () => state,
    reset: () => set(IDLE),
    destinations,
  };
}
