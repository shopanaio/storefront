import useCart from '@src/hooks/cart/useCart';
import '@src/modules/checkout/vendors/autoload';
import { Checkout } from '@src/modules/checkout';
import { CheckoutBrand } from '@src/modules/checkout/page/brand';

const onConfirm = () => {
  console.log('onConfirm');
};

const features = {
  auth: true,
};

export const CheckoutPageClient = () => {
  const { cart } = useCart();

  return (
    <Checkout
      cart={cart}
      onConfirm={onConfirm}
      brand={<CheckoutBrand />}
      features={features}
    />
  );
};
