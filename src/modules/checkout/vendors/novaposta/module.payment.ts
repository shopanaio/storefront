import {
  ProviderModuleApi,
  ProviderModuleType,
} from '@src/modules/checkout/vendors/types';
import { NPProvider } from './components/Provider';

import { NPLogo as LogoComponent } from './components/Logo';
import { CodPaymentMethod } from './components/methods/CodPaymentMethod';

const paymentProviderModule: ProviderModuleApi = {
  provider: 'novaposhta',
  moduleType: ProviderModuleType.Payment,
  Component: NPProvider,
  config: {
    logo: LogoComponent,
    methods: [
      {
        code: 'cod_cash',
        Component: CodPaymentMethod,
      },
    ],
  },
};

export default paymentProviderModule;
