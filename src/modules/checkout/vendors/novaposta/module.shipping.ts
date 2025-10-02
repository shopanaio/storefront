import type { ShippingProviderModuleApi } from '@src/modules/registry';
import { NPShippingProvider } from './components/ShippingProvider';

/**
 * Nova Poshta shipping module API that can be consumed by checkout.
 */
const shippingProviderModule: ShippingProviderModuleApi = {
  provider: 'novaposhta',
  label: 'Nova Poshta',
  Component: NPShippingProvider,
};

export default shippingProviderModule;
