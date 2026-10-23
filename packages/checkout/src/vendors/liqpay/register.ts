import { ProviderModuleType } from '#checkout/vendors/types';
import { registerModule } from '@shopana/storefront-sdk/registry';

/**
 * Registers the LiqPay payment module under the app provider code.
 */
registerModule({
  type: ProviderModuleType.Payment,
  slug: 'liqpay',
  loader: async () => (await import('./module.payment')).default,
});
