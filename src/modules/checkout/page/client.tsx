import useCart from '@src/hooks/cart/useCart';
import '@src/modules/checkout/vendors/autoload';
import { Checkout } from '@src/modules/checkout';
import { CheckoutBrand } from '@src/modules/checkout/page/brand';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRoutes } from '@src/hooks/useRoutes';

const onConfirm = () => {
  console.log('onConfirm');
};

const features = {
  auth: true,
};

/**
 * Client page for the Checkout module. Redirects to the localized home page
 * if the cart is not found once cart loading is completed.
 */
export const CheckoutPageClient = () => {
  const { cart, loaded } = useCart();
  const router = useRouter();
  const routes = useRoutes();

  useEffect(() => {
    if (loaded && !cart) {
      router.replace(routes.home.path());
    }
  }, [loaded, cart, router, routes]);

  return (
    <Checkout
      cart={cart}
      onConfirm={onConfirm}
      brand={<CheckoutBrand />}
      features={features}
    />
  );
};
