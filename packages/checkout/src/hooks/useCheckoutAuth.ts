import { useCallback } from 'react';
import {
  useSessionStatus,
  useSignInPending,
  useSignOut,
  useUser,
} from '@shopana/storefront-sdk/modules/session/react';
import { useCartSetters } from '@shopana/storefront-sdk/modules/cart/react/context/CartContext';
import { useLoginIdentifier } from '@shopana/storefront-auth/ui';
import type { CheckoutAuthProps } from '#checkout/theme';
import { flushPendingInputs } from '#checkout/state/pendingInputs';
import { useCheckoutSignIn } from '#checkout/context/CheckoutSignInContext';

/** How long a social sign-in waits for the held-back input to save before leaving the page. */
const FLUSH_TIMEOUT_MS = 3000;

function withTimeout(promise: Promise<unknown>, ms: number): Promise<unknown> {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
}

/**
 * Sends what the buyer typed and waits for the queued saves (up to 3 s), so the input is on the
 * checkout when the buyer comes back from a social provider signed in (section 7); the account
 * claims this checkout on return (F1).
 */
export function useSaveCheckoutInput(): () => Promise<void> {
  const { waitForMutations } = useCartSetters();
  return useCallback(async () => {
    const saved = Promise.allSettled(flushPendingInputs()).then(() =>
      waitForMutations()
    );
    await withTimeout(saved, FLUSH_TIMEOUT_MS).catch(() => undefined);
  }, [waitForMutations]);
}

/**
 * Sign-in state and actions of the checkout (design F2). "Log in" leads to the sign-in of the
 * page (`useCheckoutSignIn`); the sign-in itself happens in the page, never on the IAM pages.
 */
export function useCheckoutAuth(): Omit<CheckoutAuthProps, 'className'> {
  const status = useSessionStatus();
  const signInPending = useSignInPending();
  const user = useUser();
  const loginIdentifier = useLoginIdentifier();
  const { signOut, isPending: signingOut } = useSignOut();
  const { requestSignIn } = useCheckoutSignIn();

  const onSignIn = useCallback(() => {
    if (status === 'loading') return;
    requestSignIn();
  }, [requestSignIn, status]);

  const onSignOut = useCallback(() => {
    void signOut().catch(() => undefined);
  }, [signOut]);

  return {
    status,
    user: user
      ? {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          // "Signed in as" shows what the buyer signed in with (A3); the email after a hosted
          // sign-in, which has no login method.
          identifier: loginIdentifier?.display ?? user.email,
        }
      : null,
    pending: signingOut || signInPending,
    onSignIn,
    onSignOut,
  };
}
