// Re-export model namespace for convenient imports
// Usage: import { model } from '@shopana/storefront-sdk'
export { model } from './model/namespace';

// Re-export main AppProvider
export { App } from './App';
export { AppProvider } from './AppProvider';
export { useLocalization } from './modules/localization/react';
export type {
  LocalizationConfig,
  LocalizationState,
  LocalePrefixMode,
} from './modules/localization/core/types';
export {
  ThemeEditorLayout,
  useThemeEditorAvailable,
  useThemeEditorGeneralSettings,
  useThemeEditorStore,
} from './editor/ThemeEditorLayout';
export { ThemeEditorApp } from './editor/ThemeEditorApp';
export { ThemeEditorPanel } from './editor/ThemeEditorPanel';
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
  ApplicationAuthClient,
  ApplicationAuthError,
} from './modules/session/core/ApplicationAuthClient';

// Public application authentication OpenAPI contract.
export type {
  components as ApplicationAuthComponents,
  operations as ApplicationAuthOperations,
  paths as ApplicationAuthPaths,
} from './openapi/application-auth';
