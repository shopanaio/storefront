import { registerModule } from '@shopana/storefront-sdk/registry';
import type { AsyncModuleLoader } from '@shopana/storefront-sdk/registry';

export interface RegisterCheckoutModuleOptions {
  loader: AsyncModuleLoader;
}

export function registerCheckoutModule({ loader }: RegisterCheckoutModuleOptions) {
  registerModule({
    type: 'page',
    slug: 'checkout',
    path: '/checkout',
    loader,
  });
}
