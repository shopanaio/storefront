// Re-export model namespace for convenient imports
// Usage: import { model } from '@shopana/storefront-sdk'
export { model } from './model/namespace';

// The root providers are framework-specific: `@shopana/storefront-sdk/App` and `/AppProvider`
// (Next.js), `/AppProviders` under another framework integration.
export type { AppPreloadConfig } from './server/app';
export {
  useLocalization,
  useFormatter,
  Money,
} from './modules/localization/react';
export { useStore, type Store } from './modules/store/react';
export type {
  LocalizationState,
  LocalePrefixMode,
  StorefrontRoutingConfig,
} from './modules/localization/core/types';
export type { CookiePolicy } from './core/cookiePolicy';
// The theme editor renders with antd, an optional peer dependency: `@shopana/storefront-sdk/editor`.
export type { ThemeEditorScope } from './editor/store';

export type {
  AspectRatioSettingDefinition,
  BlockSettingDefinition,
  BlockSettingsSchema,
  CheckboxSettingDefinition,
  ColorBackgroundSettingDefinition,
  ColorSettingDefinition,
  ColorSchemeSettingDefinition,
  EmptyBlockSettings,
  EmptySectionSettings,
  EntityPickerEntity,
  EntityPickerSettingDefinition,
  EntityPickerValueField,
  FontPickerSettingDefinition,
  IconPickerSettingDefinition,
  ImagePickerSettingDefinition,
  NumberSettingDefinition,
  RadioSettingDefinition,
  RangeSettingDefinition,
  SectionSettingDefinition,
  SectionSettingsSchema,
  SelectSettingDefinition,
  SettingOption,
  SettingDefinitionBase,
  SettingVisibility,
  SidebarSettingDefinition,
  TextAlignmentSettingDefinition,
  TextareaSettingDefinition,
  TextSettingDefinition,
  UrlSettingDefinition,
  VideoPickerSettingDefinition,
} from './core/settings';

// Public Apollo environment configuration.
export type {
  ApolloEnvironmentConfig,
  ApplicationAuthConfig,
  ApplicationAuthScope,
} from './graphql/apollo/types';

export {
  IamApplicationClient,
  ApplicationAuthError,
} from './modules/session/core/IamApplicationClient';
export {
  StorefrontSessionClient,
  StorefrontSessionError,
  storefrontSession,
  type BrowserSession,
} from './modules/session/core/StorefrontSessionClient';

// Public application authentication OpenAPI contract.
export type {
  components as ApplicationAuthComponents,
  operations as ApplicationAuthOperations,
  paths as ApplicationAuthPaths,
} from './openapi/application-auth';

export {
  createStorefrontApi,
  StorefrontMutationError,
} from './modules/storefront';
export type { StorefrontApi } from './modules/storefront';
