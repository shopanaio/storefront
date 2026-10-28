import { useEffect, useRef } from 'react';
import { useRouter } from '@shopana/storefront/navigation';
import { useCheckoutTheme } from '#checkout/theme';
import { useIsCheckoutMissing } from '#checkout/hooks/useIsCheckoutMissing';
import { useSessionExpired } from '@shopana/storefront-sdk/modules/session/react';

/**
 * Decision 5.3: a checkout that is not found (`useIsCheckoutMissing`) sends the buyer to the
 * cart. Returns whether the checkout is missing, so the page does not wait for it forever.
 * After the session expired (S6) the account checkout is only unreadable, not gone: the page
 * asks to sign in again instead of leaving for the cart.
 */
export function useCheckoutNotFound(checkoutId: string | null): boolean {
  const theme = useCheckoutTheme();
  const homePath = theme.useHomePath();
  const openCart = theme.useOpenCart();
  const router = useRouter();
  const sessionExpired = useSessionExpired();
  const handledRef = useRef<string | null>(null);
  const missing = useIsCheckoutMissing(checkoutId);

  useEffect(() => {
    if (
      !missing ||
      sessionExpired ||
      !checkoutId ||
      handledRef.current === checkoutId
    ) {
      return;
    }
    handledRef.current = checkoutId;
    router.replace(homePath);
    openCart?.();
  }, [missing, sessionExpired, checkoutId, router, homePath, openCart]);

  return missing;
}
