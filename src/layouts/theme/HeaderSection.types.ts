export interface HeaderButtonSettings {
  enabled: boolean;
  iconSize: number;
  showTextOnDesktop: boolean;
}

export interface HeaderSettings {
  colors: {
    background: string;
    text: string;
    icon: string;
    border: string;
    controlBackground: string;
    controlHoverBackground: string;
    searchBackground: string;
    searchBorder: string;
    primaryButtonBackground: string;
    primaryButtonText: string;
    badgeBackground: string;
    badgeText: string;
  };
  layout: {
    sticky: boolean;
    showShadow: boolean;
    controlHeight: number;
    desktopMaxWidth: number;
    wideMaxWidth: number;
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
    showDivider: boolean;
  };
  wishlist: HeaderButtonSettings;
  account: HeaderButtonSettings;
  cart: HeaderButtonSettings;
}
