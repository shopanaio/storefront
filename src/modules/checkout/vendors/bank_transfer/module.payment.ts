import {
  ProviderModuleApi,
  ProviderModuleType,
} from '@src/modules/checkout/vendors/types';
import { BTProvider } from './components/Provider';
import { BTLogo as LogoComponent } from './components/Logo';
import { BankTransferPaymentMethod } from './components/methods/BankTransferPaymentMethod';

/**
 * Payment provider module definition for bank_transfer.
 */
const paymentProviderModule: ProviderModuleApi = {
  provider: 'bank_transfer',
  moduleType: ProviderModuleType.Payment,
  config: {
    logo: LogoComponent,
    methods: [
      {
        code: 'bank_transfer',
        Component: BankTransferPaymentMethod,
      },
    ],
  },
  Component: BTProvider,
};

export default paymentProviderModule;
