/**
 * Form and overlay primitives shared by the storefront packages: the checkout and the sign-in
 * screens of `@shopana/storefront-auth/ui`. Built on antd; colors, sizes and radii come from
 * the antd tokens, so a theme restyles them with its `ConfigProvider`.
 */
export {
  FloatingLabelInput,
  type FloatingLabelInputProps,
} from './FloatingLabelInput';
export {
  FloatingLabelPassword,
  type FloatingLabelPasswordProps,
} from './FloatingLabelPassword';
export { PhoneInput, type PhoneInputProps } from './phone/PhoneInput';
export {
  CountryPicker,
  CountryFlag,
  DEFAULT_COUNTRY_PICKER_TEXTS,
  type CountryPickerProps,
  type CountryPickerTexts,
} from './phone/CountryPicker';
export {
  countryLabels,
  countryOptions,
  type Country,
  type CountryOption,
} from './phone/countries';
export {
  DrawerBase,
  useIsDrawerMobile,
  type DrawerBaseProps,
} from './drawer/DrawerBase';
export {
  Vaul,
  useInsideDrawer,
  type DrawerDirection,
  type VaulProps,
} from './drawer/Vaul';
export {
  ResponsiveDialog,
  useIsPhone,
  type ResponsiveDialogProps,
} from './ResponsiveDialog';
export { breakpoints, mq } from './breakpoints';
export { useMediaQuery } from './useMediaQuery';
export {
  formatPhoneNumberIntl,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
} from 'react-phone-number-input';
