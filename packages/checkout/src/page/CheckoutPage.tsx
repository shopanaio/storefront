'use client';

import {
  lazy,
  Suspense,
  useSyncExternalStore,
  type ComponentProps,
} from 'react';
import { BrandBar } from '#checkout/components/BrandBar';
import { CheckoutSkeleton } from '#checkout/components/CheckoutSkeleton';

let pageChunk: Promise<typeof import('./client')> | null = null;

/**
 * Loads the checkout's code ahead of its page, once: a host calls it where the checkout is the
 * likely next step (a cart), so the page renders its form with its first frame.
 */
export const preloadCheckoutPage = () => (pageChunk ??= import('./client'));

const CheckoutPageClient = lazy(() =>
  preloadCheckoutPage().then((m) => ({ default: m.CheckoutPageClient }))
);

const subscribe = () => () => {};

/** False on the server and while hydrating, true once the page runs in the browser. */
const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

type CheckoutPageProps = ComponentProps<typeof CheckoutPageClient>;

/**
 * The checkout page. Its code loads in a chunk of its own and renders in the browser only; the
 * server, the hydration and the wait for the chunk show the page's skeleton with the store's
 * brand, so the page is laid out from its first frame. The skeleton needs none of the
 * checkout's providers: it is all this light part brings.
 */
export const CheckoutPage = (props: CheckoutPageProps) => {
  const hydrated = useHydrated();
  const Brand = props.theme?.Brand;
  const skeleton = (
    <CheckoutSkeleton
      header={<BrandBar>{Brand ? <Brand /> : null}</BrandBar>}
    />
  );
  if (!hydrated) return skeleton;
  return (
    <Suspense fallback={skeleton}>
      <CheckoutPageClient {...props} />
    </Suspense>
  );
};
