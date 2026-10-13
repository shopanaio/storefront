import { Checkout } from '#checkout/components/Checkout';
import { useCallback, useEffect } from 'react';
import { useRouter } from '@shopana/storefront/next/navigation';
import useCartId from '@shopana/storefront-sdk/modules/cart/react/hooks/useCartId';
import { useDefaultCartCleanup } from '#checkout/hooks/useDefaultCartCleanup';
import type { CheckoutThemeAdapter } from '#checkout/theme';

const features = {
  auth: true,
};

/**
 * Client page for the Checkout module. Redirects to the localized home page
 * if the checkout is not found once checkout loading is completed.
 */
export const CheckoutPageClient = ({ theme }: { theme: CheckoutThemeAdapter }) => {
  const { cartId, loaded } = useCartId();
  const router = useRouter();
  const homePath = theme.useHomePath();
  const cleanup = useDefaultCartCleanup();
  const Brand = theme.Brand;

  useEffect(() => {
    if (loaded && !cartId) {
      router.replace(homePath);
    }
  }, [loaded, cartId, router, homePath]);

  const handleConfirm = useCallback(() => {
    cleanup(cartId);
  }, [cleanup, cartId]);

  return (
    <Checkout
      cartId={cartId}
      onConfirm={handleConfirm}
      brand={<Brand />}
      features={features}
      theme={theme}
    />
  );
};
