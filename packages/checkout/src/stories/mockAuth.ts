import { useSyncExternalStore } from 'react';
import { mocked } from 'storybook/test';
import {
  useAuthResult,
  useIsAuthenticated,
  useLoginMethod,
  useSessionExpired,
  useSignInPending,
  useUser,
} from '@shopana/storefront-sdk/modules/session/react';
import { CART_CLAIMED_EVENT } from '@shopana/storefront-sdk/modules/cart/react/providers/AccountCartSync';
import { AuthError } from '@shopana/storefront-auth';
import type {
  AuthConfiguration,
  AuthMethods,
  AuthStep,
} from '@shopana/storefront-auth';
import { useAuth, type AuthFlowStep, type UseAuthResult } from '@shopana/storefront-auth/react';
import type { Checkout } from '#checkout/types/entity';

/**
 * The headless sign-in of the stories: the real screens of `@shopana/storefront-auth/ui` over
 * a `useAuth()` that answers like IAM. The email or SMS code is `000000`; any password signs
 * in, `wrong` is refused. A sign-in signs the buyer into the mock checkout and the account
 * claims the cart a moment later (G4).
 */
export const STORY_CODE = '000000';

/** Why a provider sign-in did not complete (`useAuthResult`). */
type AuthResult = 'cancelled' | 'accountNotLinked' | 'failed';

export interface MockSessionOptions {
  /** How the signed-in buyer of the story signed in (A3, A4); email by default. */
  loginMethod?: 'email' | 'phone';
  /** Confirmed phone of the account, for a phone sign-in. */
  phone?: string;
  /** The session ended while the account checkout was open (S6). */
  sessionExpired?: boolean;
  /** Back from a social provider without a session. */
  authResult?: AuthResult | null;
  /** Sign-in methods of the store; both codes, the password and two providers by default. */
  methods?: Partial<AuthMethods>;
}

const DEFAULT_METHODS: AuthMethods = {
  password: { signIn: true, signUp: true, reset: true, minLength: 10, maxLength: 128 },
  emailOtp: { signIn: true, signUp: true, codeLength: 6 },
  phoneOtp: { signIn: true, signUp: true, codeLength: 6 },
  social: [
    { provider: 'google', signUp: true },
    { provider: 'facebook', signUp: true },
  ],
};

interface SessionState {
  loginMethod: 'email' | 'phone' | null;
  phone: string | null;
  signInPending: boolean;
  sessionExpired: boolean;
  authResult: AuthResult | null;
}

interface FlowState {
  step: AuthFlowStep;
  error: AuthError | null;
  isPending: boolean;
}

function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next: Partial<T>) => {
      value = { ...value, ...next };
      listeners.forEach((listener) => listener());
    },
    reset: (next: T) => {
      value = next;
      listeners.forEach((listener) => listener());
    },
    use: () =>
      useSyncExternalStore(
        (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        () => value
      ),
  };
}

const session = createStore<SessionState>({
  loginMethod: null,
  phone: null,
  signInPending: false,
  sessionExpired: false,
  authResult: null,
});

const flow = createStore<FlowState>({ step: { type: 'idle' }, error: null, isPending: false });

const LATENCY_MS = 500;
const wait = (ms = LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

export interface MockSessionBridge {
  /** The customer of the mock checkout, read in render. */
  useCustomer: () => Checkout.Customer | null;
  /** Signs the buyer into the mock checkout, or out with null. */
  setCustomer: (customer: Checkout.Customer | null, phone?: string | null) => void;
}

/** Points the session hooks of the SDK and `useAuth()` at the story state. */
export function mockSession(options: MockSessionOptions = {}, bridge: MockSessionBridge) {
  const methods: AuthMethods = { ...DEFAULT_METHODS, ...options.methods };
  const configuration: AuthConfiguration = {
    methods,
    emailVerificationRequired: false,
    emailVerificationMethod: 'otp',
    defaultLocale: 'uk',
  };
  session.reset({
    loginMethod: options.loginMethod ?? 'email',
    phone: options.phone ?? null,
    signInPending: false,
    sessionExpired: options.sessionExpired ?? false,
    authResult: options.authResult ?? null,
  });
  flow.reset({ step: { type: 'idle' }, error: null, isPending: false });

  mocked(useIsAuthenticated).mockImplementation(() => Boolean(bridge.useCustomer()));
  mocked(useUser).mockImplementation(() => {
    const customer = bridge.useCustomer();
    const { phone } = session.use();
    return customer
      ? ({
          id: customer.id,
          email: customer.email ?? '',
          phone: phone ?? undefined,
          firstName: customer.firstName ?? undefined,
          lastName: customer.lastName ?? undefined,
        } as ReturnType<typeof useUser>)
      : null;
  });
  mocked(useLoginMethod).mockImplementation(() => {
    const customer = bridge.useCustomer();
    const { loginMethod } = session.use();
    return customer ? loginMethod : null;
  });
  mocked(useSignInPending).mockImplementation(() => session.use().signInPending);
  mocked(useSessionExpired).mockImplementation(() => session.use().sessionExpired);
  mocked(useAuthResult).mockImplementation(() => ({
    result: session.use().authResult,
    clear: () => session.set({ authResult: null }),
  }));

  const destinations: { email?: string; phone?: string } = {};

  /** Signed in: the session, then the account claims the cart (G4). */
  const signIn = (method: 'email' | 'phone') => {
    const email = method === 'email' ? (destinations.email ?? 'olena@example.com') : '';
    session.set({
      loginMethod: method,
      phone: method === 'phone' ? (destinations.phone ?? '+380671234567') : null,
      sessionExpired: false,
      authResult: null,
      signInPending: true,
    });
    bridge.setCustomer(
      {
        id: 'customer-1',
        displayName: 'Olena Kovalenko',
        firstName: 'Olena',
        lastName: 'Kovalenko',
        email: email || null,
      },
      method === 'phone' ? (destinations.phone ?? '+380671234567') : undefined
    );
    void wait(1200).then(() => {
      session.set({ signInPending: false });
      window.dispatchEvent(
        new CustomEvent(CART_CLAIMED_EVENT, {
          detail: { checkoutId: 'checkout-1', mergedFromCheckoutId: null },
        })
      );
    });
  };

  /** Runs a step like the real hook: pending, then the step or an error. */
  const run = async (
    answer: () => AuthStep | AuthError,
    toStep: (step: AuthStep) => AuthFlowStep
  ): Promise<AuthStep | null> => {
    flow.set({ isPending: true, error: null });
    await wait();
    const result = answer();
    if (result instanceof AuthError) {
      flow.set({ isPending: false, error: result });
      return null;
    }
    flow.set({ isPending: false, step: toStep(result) });
    return result;
  };

  const otp = (channel: 'email' | 'phone') => {
    const send = (destination?: string) => {
      const target = destination ?? destinations[channel] ?? '';
      destinations[channel] = target;
      return run(
        () => ({ type: 'otpSent', channel, resendAfter: 42, expiresIn: 600 }),
        () => ({
          type: 'otpSent',
          channel,
          destination: target,
          resendIn: 42,
          expiresAt: Date.now() + 600_000,
        })
      );
    };
    return {
      send,
      resend: () => send(),
      verify: (code: string) =>
        run(
          () =>
            code === STORY_CODE
              ? ({ type: 'completed' } as AuthStep)
              : new AuthError('invalidCredentials', 'Wrong code', 400),
          (step) => {
            if (step.type === 'completed') signIn(channel);
            return step.type === 'completed' ? { type: 'completed' } : flow.get().step;
          }
        ),
    };
  };

  const emailOtp = otp('email');
  const phoneOtp = otp('phone');

  const actions: Omit<UseAuthResult, 'step' | 'error' | 'isPending'> = {
    status: 'ready',
    configuration,
    methods,
    emailOtp,
    phoneOtp,
    password: {
      signIn: (input) => {
        destinations.email = input.email;
        return run(
          () =>
            input.password === 'wrong'
              ? new AuthError('invalidCredentials', 'Wrong password', 400)
              : ({ type: 'completed' } as AuthStep),
          () => {
            signIn('email');
            return { type: 'completed' };
          }
        );
      },
      signUp: (input) => {
        destinations.email = input.email;
        return run(
          () => ({ type: 'completed' }) as AuthStep,
          () => {
            signIn('email');
            return { type: 'completed' };
          }
        );
      },
      forgot: (email) => {
        destinations.email = email;
        return run(
          () => ({ type: 'resetLinkSent' }),
          () => ({ type: 'resetLinkSent', email })
        );
      },
      reset: () => run(() => ({ type: 'passwordReset' }), () => ({ type: 'passwordReset' })),
    },
    emailVerification: {
      resend: (email) =>
        run(
          () => ({ type: 'verificationSent' }),
          () => ({ type: 'verificationSent', email: email ?? destinations.email ?? '' })
        ),
    },
    social: {
      // The browser would leave for the provider here; the story stays on "Going to Google…".
      start: async () => {
        flow.set({ isPending: true, error: null });
        await new Promise(() => undefined);
      },
    },
    reset: () => flow.set({ step: { type: 'idle' }, error: null }),
  };

  mocked(useAuth).mockImplementation(() => {
    const { step, error, isPending } = flow.use();
    return { ...actions, step, error, isPending };
  });

  return {
    signOut: () => {
      session.set({ loginMethod: null, phone: null });
      bridge.setCustomer(null);
    },
    loginMethod: () => session.get().loginMethod,
    phone: () => session.get().phone,
  };
}
