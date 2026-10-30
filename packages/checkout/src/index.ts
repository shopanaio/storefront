import dynamic from '@shopana/storefront/dynamic';
// The checkout vendors register themselves on import, under every bundler.
import './vendors/address-ua/register';
import './vendors/liqpay/register';
import './vendors/nova-poshta/register';

export { usePlacedOrderNumber } from './hooks/usePlacedOrderNumber';

export const Checkout = dynamic(
  () => import('./components/Checkout').then((m) => m.Checkout),
  { ssr: false }
);

export { CheckoutPage, preloadCheckoutPage } from './page/CheckoutPage';

export const CheckoutReturnPage = dynamic(
  () => import('./page/return').then((m) => m.CheckoutReturnPageClient),
  { ssr: false }
);
