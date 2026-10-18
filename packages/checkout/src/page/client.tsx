import { Checkout } from '#checkout/components/Checkout';
import { useCallback, useEffect } from 'react';
import { useRouter } from '@shopana/storefront/next/navigation';
import useCartId from '@shopana/storefront-sdk/modules/cart/react/hooks/useCartId';
import { useDefaultCartCleanup } from '#checkout/hooks/useDefaultCartCleanup';
import type { CheckoutThemeAdapter } from '#checkout/theme';
import type { OrderAcceptedEvent } from '#checkout/state/checkoutBus';
import { useIsPlacementBusy } from '#checkout/state/placement/placementStore';

const features = {
  auth: true,
};

/**
 * Client page for the Checkout module. Redirects to the localized home page when there is no
 * cart, unless a placement attempt is running or its result is shown.
 */
export const CheckoutPageClient = ({
  theme,
  onOrderAccepted,
}: {
  theme: CheckoutThemeAdapter;
  /** Called after the cart is cleared for an accepted order, as on the return page. */
  onOrderAccepted?: (event: OrderAcceptedEvent) => void;
}) => {
  const { cartId, loaded } = useCartId();
  const router = useRouter();
  const homePath = theme.useHomePath();
  const cleanup = useDefaultCartCleanup();
  const placementBusy = useIsPlacementBusy();
  const Brand = theme.Brand;

  useEffect(() => {
    if (loaded && !cartId && !placementBusy) {
      router.replace(homePath);
    }
  }, [loaded, cartId, placementBusy, router, homePath]);

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
      features={features}
      theme={theme}
    />
  );
};
