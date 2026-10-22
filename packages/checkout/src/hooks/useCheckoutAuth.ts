import { useCallback } from 'react';
import {
  useLoginMethod,
  useSessionStatus,
  useSignInPending,
  useUser,
} from '@shopana/storefront-sdk/modules/session/react';
import { useSignOut } from '@shopana/storefront-sdk/modules/session/react/hooks';
import { useCartSetters } from '@shopana/storefront-sdk/modules/cart/react/context/CartContext';
import { formatPhoneNumberIntl } from '@shopana/storefront-ui';
import type { CheckoutAuthProps } from '#checkout/theme';
import { flushPendingInputs } from '#checkout/state/pendingInputs';
import { useAuthDialogStore } from '#checkout/state/authDialogStore';

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
 * Sign-in state and actions of the checkout (design F2). "Log in" opens the sign-in drawer of
 * the checkout; the sign-in itself happens in the page, never on the IAM pages.
 */
export function useCheckoutAuth(): Omit<CheckoutAuthProps, 'className'> {
  const status = useSessionStatus();
  const signInPending = useSignInPending();
  const user = useUser();
  const loginMethod = useLoginMethod();
  const { signOut, isPending: signingOut } = useSignOut();
  const setDialogOpen = useAuthDialogStore((state) => state.setOpen);

  const onSignIn = useCallback(() => {
    if (status === 'loading') return;
    setDialogOpen(true);
  }, [setDialogOpen, status]);

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
          // "Signed in as" shows what the buyer signed in with (A3).
          identifier: identifierOf(loginMethod, user),
        }
      : null,
    pending: signingOut || signInPending,
    onSignIn,
    onSignOut,
  };
}

/** What the buyer signed in with, as they typed it: an email, or the phone in its format. */
function identifierOf(
  loginMethod: 'email' | 'phone' | null,
  user: { email: string; phone?: string }
): string {
  const phone = user.phone ? formatPhoneNumberIntl(user.phone) || user.phone : '';
  return (loginMethod === 'phone' ? phone : user.email) || phone || user.email;
}
