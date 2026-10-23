import { ProviderModuleApi, ProviderModuleType } from '#checkout/vendors/types';
import { createPaymentProvider } from '#checkout/vendors/shared/createPaymentProvider';
import { loadLiqPayMessages } from './i18n';
import { LiqPayLogo } from './components/Logo';
import { LiqPayPaymentMethod } from './components/methods/LiqPayPaymentMethod';

/**
 * Payment module of the LiqPay app.
 *
 * The `liqpay` method has the ONLINE flow and takes no customer input:
 * the customer pays on the LiqPay page after `placeOrder` returns a redirect.
 */
const paymentProviderModule: ProviderModuleApi = {
  provider: 'liqpay',
  moduleType: ProviderModuleType.Payment,
  Component: createPaymentProvider(),
  messages: { scope: 'liqpay', load: loadLiqPayMessages },
  config: {
    logo: LiqPayLogo,
    methods: [
      {
        code: 'liqpay',
        Component: LiqPayPaymentMethod,
      },
    ],
  },
};

export default paymentProviderModule;
