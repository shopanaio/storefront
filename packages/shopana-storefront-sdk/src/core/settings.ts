type StringKeyOf<T> = Extract<keyof T, string>;
type SettingValue<T> = Exclude<T, null | undefined>;
type StringSettingKey<T> = {
  [K in StringKeyOf<T>]: SettingValue<T[K]> extends string ? K : never;
}[StringKeyOf<T>];
type NumberSettingKey<T> = {
  [K in StringKeyOf<T>]: SettingValue<T[K]> extends number ? K : never;
}[StringKeyOf<T>];
type BooleanSettingKey<T> = {
  [K in StringKeyOf<T>]: SettingValue<T[K]> extends boolean ? K : never;
}[StringKeyOf<T>];
type SelectSettingKey<T> = {
  [K in StringKeyOf<T>]: SettingValue<T[K]> extends string | number ? K : never;
}[StringKeyOf<T>];

export type SettingVisibility<TSettings extends object> = {
  [K in StringKeyOf<TSettings>]:
    | { id: K; equals: SettingValue<TSettings[K]> }
    | { id: K; notEquals: SettingValue<TSettings[K]> };
}[StringKeyOf<TSettings>];

export interface SettingDefinitionBase<
  TSettings extends object,
  TId extends StringKeyOf<TSettings>,
> {
  id: TId;
  label: string;
  info?: string;
  visibleIf?: SettingVisibility<TSettings>;
}

type StringSettingDefinition<
  TSettings extends object,
  TType extends string,
  TAttributes extends object = Record<never, never>,
> = {
  [K in StringSettingKey<TSettings>]: SettingDefinitionBase<TSettings, K> & {
    type: TType;
    default?: SettingValue<TSettings[K]>;
  } & TAttributes;
}[StringSettingKey<TSettings>];

export type CheckboxSettingDefinition<TSettings extends object> = {
  [K in BooleanSettingKey<TSettings>]: SettingDefinitionBase<TSettings, K> & {
    type: 'checkbox';
    default?: SettingValue<TSettings[K]>;
  };
}[BooleanSettingKey<TSettings>];

export type NumberSettingDefinition<TSettings extends object> = {
  [K in NumberSettingKey<TSettings>]: SettingDefinitionBase<TSettings, K> & {
    type: 'number';
    default?: SettingValue<TSettings[K]>;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  };
}[NumberSettingKey<TSettings>];

export type RangeSettingDefinition<TSettings extends object> = {
  [K in NumberSettingKey<TSettings>]: SettingDefinitionBase<TSettings, K> & {
    type: 'range';
    default: SettingValue<TSettings[K]>;
    min: number;
    max: number;
    step?: number;
    unit?: string;
  };
}[NumberSettingKey<TSettings>];

export interface SettingOption<TValue extends string | number> {
  value: TValue;
  label: string;
  group?: string;
}

type ChoiceSettingDefinition<
  TSettings extends object,
  TType extends 'select' | 'radio',
> = {
  [K in SelectSettingKey<TSettings>]: SettingDefinitionBase<TSettings, K> & {
    type: TType;
    default?: SettingValue<TSettings[K]>;
    options: readonly SettingOption<
      Extract<SettingValue<TSettings[K]>, string | number>
    >[];
    presentation?: TType extends 'select' ? 'dropdown' | 'segmented' : never;
  };
}[SelectSettingKey<TSettings>];

export type SelectSettingDefinition<TSettings extends object> =
  ChoiceSettingDefinition<TSettings, 'select'>;
export type RadioSettingDefinition<TSettings extends object> =
  ChoiceSettingDefinition<TSettings, 'radio'>;

export type TextSettingDefinition<TSettings extends object> =
  StringSettingDefinition<TSettings, 'text', { placeholder?: string }>;
export type TextareaSettingDefinition<TSettings extends object> =
  StringSettingDefinition<TSettings, 'textarea', { placeholder?: string }>;
export type ColorSettingDefinition<TSettings extends object> =
  StringSettingDefinition<TSettings, 'color', { placeholder?: string }>;
export type ColorBackgroundSettingDefinition<TSettings extends object> =
  StringSettingDefinition<TSettings, 'color_background'>;
export type ColorSchemeSettingDefinition<TSettings extends object> =
  StringSettingDefinition<TSettings, 'color_scheme'>;
export type FontPickerSettingDefinition<TSettings extends object> =
  StringSettingDefinition<TSettings, 'font_picker'>;
export type ImagePickerSettingDefinition<TSettings extends object> =
  StringSettingDefinition<TSettings, 'image_picker'>;
export type VideoPickerSettingDefinition<TSettings extends object> =
  StringSettingDefinition<TSettings, 'video_picker'>;
export type UrlSettingDefinition<TSettings extends object> =
  StringSettingDefinition<TSettings, 'url', { placeholder?: string }>;
export type TextAlignmentSettingDefinition<TSettings extends object> =
  StringSettingDefinition<TSettings, 'text_alignment'>;
export type AspectRatioSettingDefinition<TSettings extends object> =
  StringSettingDefinition<TSettings, 'aspect_ratio'>;
export type IconPickerSettingDefinition<TSettings extends object> =
  StringSettingDefinition<TSettings, 'icon_picker'>;

export type EntityPickerEntity =
  | 'category'
  | 'product'
  | 'article'
  | 'blog'
  | 'page'
  | 'navigation_menu'
  | 'navigation_menu_item';

export type EntityPickerValueField = 'handle' | 'id';

type EntityPickerSelection =
  | {
      entity: 'navigation_menu_item';
      valueField: 'id';
      /** Limits navigation-item choices to one navigation menu. */
      navigationMenuId?: string;
    }
  | {
      entity: Exclude<EntityPickerEntity, 'navigation_menu_item'>;
      valueField?: EntityPickerValueField;
      navigationMenuId?: never;
    };

/** Stores one stable entity field, never a hydrated entity. */
export type EntityPickerSettingDefinition<TSettings extends object> = {
  [K in StringSettingKey<TSettings>]: SettingDefinitionBase<TSettings, K> & {
    type: 'entity_picker';
    default?: SettingValue<TSettings[K]>;
  } & EntityPickerSelection;
}[StringSettingKey<TSettings>];

export type SidebarSettingDefinition =
  | { type: 'header'; content: string }
  | { type: 'paragraph'; content: string }
  | { type: 'notice'; content: string; tone?: 'info' | 'warning' }
  | { type: 'divider' };

export type SectionSettingDefinition<TSettings extends object> =
  | CheckboxSettingDefinition<TSettings>
  | NumberSettingDefinition<TSettings>
  | RangeSettingDefinition<TSettings>
  | SelectSettingDefinition<TSettings>
  | RadioSettingDefinition<TSettings>
  | TextSettingDefinition<TSettings>
  | TextareaSettingDefinition<TSettings>
  | ColorSettingDefinition<TSettings>
  | ColorBackgroundSettingDefinition<TSettings>
  | ColorSchemeSettingDefinition<TSettings>
  | FontPickerSettingDefinition<TSettings>
  | ImagePickerSettingDefinition<TSettings>
  | VideoPickerSettingDefinition<TSettings>
  | UrlSettingDefinition<TSettings>
  | TextAlignmentSettingDefinition<TSettings>
  | AspectRatioSettingDefinition<TSettings>
  | IconPickerSettingDefinition<TSettings>
  | EntityPickerSettingDefinition<TSettings>
  | SidebarSettingDefinition;

export type BlockSettingDefinition<TSettings extends object> =
  SectionSettingDefinition<TSettings>;

/** Shopify-inspired editor metadata for a section's settings. */
export interface SectionSettingsSchema<
  TSettings extends object = Record<never, never>,
> {
  name: string;
  settings: readonly SectionSettingDefinition<TSettings>[];
}

/** The same editor contract applied to one block type or instance. */
export interface BlockSettingsSchema<
  TSettings extends object = Record<never, never>,
> {
  name: string;
  settings: readonly BlockSettingDefinition<TSettings>[];
}

export type EmptySectionSettings = Record<never, never>;
export type EmptyBlockSettings = Record<never, never>;
