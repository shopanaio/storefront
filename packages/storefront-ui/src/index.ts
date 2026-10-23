/**
 * Form and overlay primitives shared by the storefront packages: the checkout and the sign-in
 * screens of `@shopana/storefront-auth/ui`. Built on antd; colors, sizes and radii come from
 * the antd tokens, so a theme restyles them with its `ConfigProvider`. The phone, drawer and
 * banner parts are also published on their own entries (`/phone`, `/drawer`, `/banner`).
 */
export {
  StorefrontUIProvider,
  type CountryPickerTexts,
  type StorefrontUIProviderProps,
  type StorefrontUITextOverrides,
  type StorefrontUITexts,
} from './StorefrontUIProvider';
export {
  FLOATING_FIELD_HEIGHT,
  FloatingLabelInput,
  type FloatingLabelInputPart,
  type FloatingLabelInputProps,
} from './FloatingLabelInput';
export {
  FloatingLabelPassword,
  type FloatingLabelPasswordProps,
} from './FloatingLabelPassword';
export { InlineLink, type InlineLinkProps } from './InlineLink';
export { VisuallyHidden, type VisuallyHiddenProps } from './VisuallyHidden';
export { isEmail } from './validation';
export * from './phone';
export * from './drawer';
export * from './banner';
export { breakpoints, mq, queries, type Breakpoint } from './breakpoints';
export {
  useBreakpointDown,
  useMediaQuery,
  type MediaQueryOptions,
} from './useMediaQuery';
export type { DomAttributes } from './dom';
