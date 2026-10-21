import {
  ProviderModuleApi,
  ProviderModuleType,
} from '#checkout/vendors/types';
import { createPaymentProvider } from '#checkout/vendors/shared/createPaymentProvider';
import { loadNovaPoshtaMessages, NOVA_POSHTA_SCOPE } from './i18n';
import { NOVA_POSHTA } from './address';
import { NPLogo as LogoComponent } from './components/Logo';
import { CodPaymentMethod } from './components/methods/CodPaymentMethod';

/**
 * Payment module of the Nova Poshta app: cash on delivery.
 * The API offers it only when Nova Poshta delivery is selected.
 */
const paymentProviderModule: ProviderModuleApi = {
  provider: NOVA_POSHTA,
  moduleType: ProviderModuleType.Payment,
  Component: createPaymentProvider(),
  messages: { scope: NOVA_POSHTA_SCOPE, load: loadNovaPoshtaMessages },
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
