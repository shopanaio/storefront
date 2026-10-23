import { useSyncExternalStore } from 'react';
import { mocked } from 'storybook/test';
import {
  useAuthResult,
  useIsAuthenticated,
  useLoginMethod,
  useSessionExpired,
  useSessionStatus,
  useSignInPending,
  useUser,
} from '@shopana/storefront-sdk/modules/session/react';
import { CART_CLAIMED_EVENT } from '@shopana/storefront-sdk/modules/cart/react';
import type { AuthMethods } from '@shopana/storefront-auth';
import { useAuth } from '@shopana/storefront-auth/react';
import { createMockAuth, EMAIL, PHONE } from '@shopana/storefront-auth/testing';
import type { Checkout } from '#checkout/types/entity';

/**
 * The storefront session of the checkout stories over the headless sign-in of
 * `@shopana/storefront-auth/testing` (`createMockAuth`: the code is `MOCK_CODE`, any password
 * but `WRONG_PASSWORD` signs in). A sign-in signs the buyer into the mock checkout and the
 * account claims the cart a moment later (G4).
 */

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
  /** Sign-in methods of the store over `MOCK_METHODS` (everything enabled). */
  methods?: Partial<AuthMethods>;
}

interface SessionState {
  loginMethod: 'email' | 'phone' | null;
  phone: string | null;
  signInPending: boolean;
  sessionExpired: boolean;
  authResult: AuthResult | null;
}

let state: SessionState = {
  loginMethod: null,
  phone: null,
  signInPending: false,
  sessionExpired: false,
  authResult: null,
};
const listeners = new Set<() => void>();

function setSession(next: Partial<SessionState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function useSessionState(): SessionState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state
  );
}

/** How long the account takes to claim the cart after a sign-in. */
const CLAIM_MS = 1200;

export interface MockSessionBridge {
  /** The customer of the mock checkout, read in render. */
  useCustomer: () => Checkout.Customer | null;
  /** Signs the buyer into the mock checkout, or out with null. */
  setCustomer: (
    customer: Checkout.Customer | null,
    phone?: string | null
  ) => void;
}

/** Points the session hooks of the SDK and `useAuth()` at the story state. */
export function mockSession(
  options: MockSessionOptions = {},
  bridge: MockSessionBridge
) {
  setSession({
    loginMethod: options.loginMethod ?? 'email',
    phone: options.phone ?? null,
    signInPending: false,
    sessionExpired: options.sessionExpired ?? false,
    authResult: options.authResult ?? null,
  });

  /** Signed in: the session, then the account claims the cart (G4). */
  const signIn = (
    method: 'email' | 'phone',
    destination: string | undefined
  ) => {
    const phone = method === 'phone' ? destination || PHONE : null;
    setSession({
      loginMethod: method,
      phone,
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
        email: method === 'email' ? destination || EMAIL : null,
      },
      phone ?? undefined
    );
    setTimeout(() => {
      setSession({ signInPending: false });
      window.dispatchEvent(
        new CustomEvent(CART_CLAIMED_EVENT, {
          detail: { checkoutId: 'checkout-1', mergedFromCheckoutId: null },
        })
      );
    }, CLAIM_MS);
  };

  const auth = createMockAuth({ methods: options.methods, onSignedIn: signIn });
  mocked(useAuth).mockImplementation(auth.useAuth);

  mocked(useIsAuthenticated).mockImplementation(() =>
    Boolean(bridge.useCustomer())
  );
  mocked(useSessionStatus).mockImplementation(() =>
    bridge.useCustomer() ? 'authenticated' : 'anonymous'
  );
  mocked(useUser).mockImplementation(() => {
    const customer = bridge.useCustomer();
    const { phone } = useSessionState();
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
    const { loginMethod } = useSessionState();
    return customer ? loginMethod : null;
  });
  mocked(useSignInPending).mockImplementation(
    () => useSessionState().signInPending
  );
  mocked(useSessionExpired).mockImplementation(
    () => useSessionState().sessionExpired
  );
  mocked(useAuthResult).mockImplementation(() => ({
    result: useSessionState().authResult,
    clear: () => setSession({ authResult: null }),
  }));

  return {
    signOut: () => {
      setSession({ loginMethod: null, phone: null });
      bridge.setCustomer(null);
    },
  };
}
