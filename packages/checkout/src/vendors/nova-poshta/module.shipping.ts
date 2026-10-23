import { ProviderModuleApi, ProviderModuleType } from '#checkout/vendors/types';
import { NPProvider } from './components/Provider';
import { NPLogo as LogoComponent } from './components/Logo';
import { createShippingMethod } from './components/methods/ShippingMethod';
import { SERVICE_RECEIVING_TYPE } from './customerInput';
import { NOVA_POSHTA } from './address';
import { loadNovaPoshtaMessages, NOVA_POSHTA_SCOPE } from './i18n';
import type { ServiceCode } from './types';

/**
 * Delivery module of the Nova Poshta app. One method per service; which services are
 * offered is decided by the backend.
 */
const shippingProviderModule: ProviderModuleApi = {
  provider: NOVA_POSHTA,
  moduleType: ProviderModuleType.Delivery,
  Component: NPProvider,
  messages: { scope: NOVA_POSHTA_SCOPE, load: loadNovaPoshtaMessages },
  config: {
    logo: LogoComponent,
    methods: (Object.keys(SERVICE_RECEIVING_TYPE) as ServiceCode[]).map(
      (code) => ({
        code,
        Component: createShippingMethod(code),
      })
    ),
  },
};

export default shippingProviderModule;
