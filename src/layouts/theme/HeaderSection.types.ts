export const HEADER_SETTINGS_VERSION = 1 as const;

export type HeaderSettingsVersion = typeof HEADER_SETTINGS_VERSION;
export type HeaderTextBreakpoint = 'md' | 'lg' | 'xl' | 'never';

export interface HeaderButtonSettings {
  enabled: boolean;
  iconSize: number;
  showTextFrom: HeaderTextBreakpoint;
}

export interface HeaderSettings {
  version: HeaderSettingsVersion;
  colors: {
    background: string;
    text: string;
    icon: string;
    border: string;
    divider: string;
    control: {
      background: string;
      hoverBackground: string;
    };
    search: {
      background: string;
      border: string;
      text: string;
      icon: string;
      placeholder: string;
    };
    primaryButton: {
      background: string;
      text: string;
    };
    badge: {
      background: string;
      text: string;
    };
  };
  layout: {
    sticky: boolean;
    showShadow: boolean;
    controlHeight: number;
    maxWidth: {
      xl: number;
      xxl: number;
    };
  };
  logo: {
    enabled: boolean;
    theme: 'dark' | 'light';
    mobileSize: number;
    desktopSize: number;
  };
  menu: {
    enabled: boolean;
    iconSize: number;
  };
  search: {
    enabled: boolean;
    iconSize: number;
    showSubmitButton: boolean;
    placeholder?: string;
    submitLabel?: string;
  };
  support: HeaderButtonSettings & {
    phoneNumber: string;
    href: string;
  };
  wishlist: HeaderButtonSettings;
  account: HeaderButtonSettings;
  cart: HeaderButtonSettings;
}

export type DeepPartial<T> = {
  [Key in keyof T]?: T[Key] extends object ? DeepPartial<T[Key]> : T[Key];
};

export type HeaderSettingsOverrides = DeepPartial<HeaderSettings>;
