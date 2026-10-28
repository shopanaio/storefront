import { Checkout } from '#checkout/components/Checkout';
import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from '@shopana/storefront/navigation';
import useCartId from '@shopana/storefront-sdk/modules/cart/react/hooks/useCartId';
import { useDefaultCartCleanup } from '#checkout/hooks/useDefaultCartCleanup';
import { resolveCheckoutTheme } from '#checkout/theme';
import type { CheckoutThemeAdapter } from '#checkout/theme';
import type { OrderAcceptedEvent } from '#checkout/state/checkoutBus';
import { useIsPlacementBusy } from '#checkout/state/placement/placementStore';
import { useSessionExpired } from '@shopana/storefront-sdk/modules/session/react';

/**
 * Client page for the Checkout module. Redirects to the localized home page when there is no
 * cart, unless a placement attempt is running or its result is shown, or the session expired
 * (S6): the account cart is then waiting behind a new sign-in.
 */
export const CheckoutPageClient = ({
  theme,
  onOrderAccepted,
}: {
  /** What the theme changes; the checkout works without it. */
  theme?: CheckoutThemeAdapter;
  /** Called after the cart is cleared for an accepted order, as on the return page. */
  onOrderAccepted?: (event: OrderAcceptedEvent) => void;
}) => {
  const { cartId, loaded } = useCartId();
  const router = useRouter();
  const resolved = useMemo(() => resolveCheckoutTheme(theme), [theme]);
  const homePath = resolved.useHomePath();
  const cleanup = useDefaultCartCleanup();
  const placementBusy = useIsPlacementBusy();
  const sessionExpired = useSessionExpired();
  const Brand = resolved.Brand;

  useEffect(() => {
    if (loaded && !cartId && !placementBusy && !sessionExpired) {
      router.replace(homePath);
    }
  }, [loaded, cartId, placementBusy, sessionExpired, router, homePath]);

  const handleOrderAccepted = useCallback(
    (event: OrderAcceptedEvent) => {
      cleanup(event.checkoutId);
      onOrderAccepted?.(event);
    },
    [cleanup, onOrderAccepted]
  );

  return (
    <Checkout
      cartId={cartId}
      onOrderAccepted={handleOrderAccepted}
      brand={<Brand />}
      theme={theme}
    />
  );
};
