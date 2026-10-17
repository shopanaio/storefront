import {
  ProviderModuleApi,
  ProviderModuleType,
} from '#checkout/vendors/types';
import { createPaymentProvider } from '#checkout/vendors/shared/createPaymentProvider';
import { loadNovapostaMessages } from './i18n';
import { NPLogo as LogoComponent } from './components/Logo';
import { CodPaymentMethod } from './components/methods/CodPaymentMethod';

/**
 * Payment module of the Nova Poshta app: cash on delivery.
 * The API offers it only when Nova Poshta delivery is selected.
 */
const paymentProviderModule: ProviderModuleApi = {
  provider: 'nova-poshta',
  moduleType: ProviderModuleType.Payment,
  Component: createPaymentProvider({
    scope: 'novaposta',
    load: loadNovapostaMessages,
  }),
  config: {
    logo: LogoComponent,
    methods: [
      {
        code: 'nova-poshta-cod',
        Component: CodPaymentMethod,
      },
    ],
  },
};

export default paymentProviderModule;
