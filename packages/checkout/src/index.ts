import dynamic from '@shopana/storefront/dynamic';

export { usePlacedOrderNumber } from './hooks/usePlacedOrderNumber';

export const Checkout = dynamic(
  () => import('./components/Checkout').then((m) => m.Checkout),
  { ssr: false }
);

export const CheckoutSkeleton = dynamic(
  () => import('./components/CheckoutSkeleton').then((m) => m.CheckoutSkeleton),
  { ssr: false }
);

export const CheckoutPage = dynamic(
  () => import('./page/client').then((m) => m.CheckoutPageClient),
  { ssr: false }
);

export const CheckoutReturnPage = dynamic(
  () => import('./page/return').then((m) => m.CheckoutReturnPageClient),
  { ssr: false }
);

/**
 * Auto-discover and register all checkout vendors.
 * This runs at server-side where require.context works with Turbopack.
 */
const vendorsContext = require.context(
  './vendors',
  true,
  /register\.(t|j)sx?$/
);
vendorsContext.keys().forEach((key) => vendorsContext(key));
