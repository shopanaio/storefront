import { ProviderModuleType } from '#checkout/vendors/types';
import { registerModule } from '@shopana/storefront-sdk/registry';

/** Address form of Ukraine. */
registerModule({
  type: ProviderModuleType.Address,
  slug: 'UA',
  loader: async () => (await import('./module')).default,
});
