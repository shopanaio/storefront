import { registerModule } from '@shopana/storefront-sdk/registry';
import type { AsyncModuleLoader } from '@shopana/storefront-sdk/registry';

export interface RegisterCheckoutModuleOptions {
  /** Loads the checkout page (`/checkout`). */
  loader: AsyncModuleLoader;
  /** Loads the payment provider return page (`/checkout/return`). */
  returnLoader: AsyncModuleLoader;
}

export function registerCheckoutModule({
  loader,
  returnLoader,
}: RegisterCheckoutModuleOptions) {
  registerModule({
    type: 'page',
    slug: 'checkout',
    path: '/checkout',
    loader,
    layoutLoader: () => import('./components/CheckoutLayout'),
  });
  registerModule({
    type: 'page',
    slug: 'checkout-return',
    path: '/checkout/return',
    loader: returnLoader,
    layoutLoader: () => import('./components/CheckoutLayout'),
  });
}
