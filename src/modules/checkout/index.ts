import dynamic from 'next/dynamic';

export const Checkout = dynamic(
  () => import('./components/Checkout').then((m) => m.Checkout),
  { ssr: false }
);

export const CheckoutSkeleton = dynamic(
  () => import('./components/CheckoutSkeleton').then((m) => m.CheckoutSkeleton),
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
