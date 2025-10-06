import '@src/modules/checkout/vendors/autoload';
import { Checkout } from '@src/modules/checkout';
import { CheckoutBrand } from '@src/modules/checkout/page/brand';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoutes } from '@src/hooks/useRoutes';
import useCartId from '@src/hooks/cart/useCartId';

const onConfirm = () => {
  console.log('onConfirm');
};

const features = {
  auth: true,
};

/**
 * Client page for the Checkout module. Redirects to the localized home page
 * if the checkout is not found once checkout loading is completed.
 */
export const CheckoutPageClient = () => {
  const { cartId, loaded } = useCartId();
  const router = useRouter();
  const routes = useRoutes();

  useEffect(() => {
    if (loaded && !cartId) {
      router.replace(routes.home.path());
    }
  }, [loaded, cartId, router, routes]);

  return (
    <Checkout
      cartId={cartId}
      onConfirm={onConfirm}
      brand={<CheckoutBrand />}
      features={features}
    />
  );
};
