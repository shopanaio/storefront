import type { PaymentProviderModuleApi } from '@src/modules/registry';
import { BTPaymentProvider } from './components/PaymentProvider';

/**
 * Payment provider module definition for bank_transfer.
 */
const paymentProviderModule: PaymentProviderModuleApi = {
  provider: 'bank_transfer',
  label: 'Bank Transfer',
  Component: BTPaymentProvider,
};

export default paymentProviderModule;
