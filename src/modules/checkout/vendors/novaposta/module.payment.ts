import { ProviderModuleApi } from '@src/modules/checkout/vendors/types';
import { NPPaymentProvider } from './components/PaymentProvider';

const paymentProviderModule: ProviderModuleApi = {
  provider: 'novaposhta',
  Component: NPPaymentProvider,
};

export default paymentProviderModule;
