import { useCallback } from 'react';
import {
  useSessionStatus,
  useSignInPending,
  useUser,
} from '@shopana/storefront-sdk/modules/session/react';
import {
  useOAuthAuthorization,
  useSignOut,
} from '@shopana/storefront-sdk/modules/session/react/hooks';
import { useCartSetters } from '@shopana/storefront-sdk/modules/cart/react/context/CartContext';
import type { CheckoutAuthProps } from '#checkout/theme';
import { flushPendingInputs } from '#checkout/state/pendingInputs';

/** How long sign-in waits for the held-back input to save before leaving the page. */
const FLUSH_TIMEOUT_MS = 3000;

function withTimeout(promise: Promise<unknown>, ms: number): Promise<unknown> {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
}

/**
 * Sign-in state and actions of the checkout (design F2). Sign-in first sends what the buyer
 * typed and waits for the queued saves, so the input is on the checkout when the buyer comes
 * back signed in (section 7); the account claims this checkout on return (F1).
 */
export function useCheckoutAuth(): Omit<CheckoutAuthProps, 'className'> {
  const status = useSessionStatus();
  const signInPending = useSignInPending();
  const user = useUser();
  const { authorize, isPending: authorizing } = useOAuthAuthorization();
  const { signOut, isPending: signingOut } = useSignOut();
  const { waitForMutations } = useCartSetters();

  const onSignIn = useCallback(() => {
    if (status === 'loading') return;
    const returnTo = `${window.location.pathname}${window.location.search}`;
    const saved = Promise.allSettled(flushPendingInputs()).then(() =>
      waitForMutations()
    );
    void withTimeout(saved, FLUSH_TIMEOUT_MS)
      .then(() => authorize({ returnTo }))
      .catch(() => undefined);
  }, [authorize, status, waitForMutations]);

  const onSignOut = useCallback(() => {
    void signOut().catch(() => undefined);
  }, [signOut]);

  return {
    status,
    user: user
      ? { email: user.email, firstName: user.firstName, lastName: user.lastName }
      : null,
    pending: authorizing || signingOut || signInPending,
    onSignIn,
    onSignOut,
  };
}
