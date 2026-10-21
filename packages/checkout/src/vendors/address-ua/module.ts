import type { AddressModuleApi } from '#checkout/vendors/types';
import { UaAddressForm } from './components/UaAddressForm';
import {
  loadNovaPoshtaMessages,
  NOVA_POSHTA_SCOPE,
} from '#checkout/vendors/nova-poshta/i18n';

const addressModule: AddressModuleApi = {
  country: 'UA',
  Component: UaAddressForm,
  messages: { scope: NOVA_POSHTA_SCOPE, load: loadNovaPoshtaMessages },
};

export default addressModule;
