import { ProviderModuleApi } from '@src/modules/checkout/vendors/types';
import { NPShippingProvider } from './components/ShippingProvider';

/**
 * Nova Poshta shipping module API that can be consumed by checkout.
 */
const shippingProviderModule: ProviderModuleApi = {
  provider: 'novaposhta',
  Component: NPShippingProvider,
};

export default shippingProviderModule;
