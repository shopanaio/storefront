import type { AddressModuleApi } from '#checkout/vendors/types';
import { UaAddressForm } from './components/UaAddressForm';

const addressModule: AddressModuleApi = {
  country: 'UA',
  Component: UaAddressForm,
};

export default addressModule;
