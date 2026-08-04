import type { SectionConfig } from '@shopana/storefront-sdk/core/types';
import { Header } from './Header';
import type { HeaderSettings } from './HeaderSection.types';

export const headerSection: SectionConfig<HeaderSettings, null> = {
  component: Header,
  settings: {
    colors: {
      background: 'var(--ant-color-primary)',
      text: '#ffffff',
      icon: '#ffffff',
      border: 'rgba(255, 255, 255, 0.18)',
      controlBackground: 'transparent',
      controlHoverBackground: 'rgba(255, 255, 255, 0.14)',
      searchBackground: 'rgba(255, 255, 255, 0.14)',
      searchBorder: 'rgba(255, 255, 255, 0.4)',
      primaryButtonBackground: '#ffffff',
      primaryButtonText: 'var(--ant-color-primary)',
      badgeBackground: '#ffffff',
      badgeText: 'var(--ant-color-primary)',
    },
    layout: {
      sticky: true,
      showShadow: true,
      controlHeight: 42,
      desktopMaxWidth: 1280,
      wideMaxWidth: 1400,
    },
    logo: {
      enabled: true,
      theme: 'light',
      mobileSize: 40,
      desktopSize: 44,
    },
    menu: {
      enabled: true,
      iconSize: 24,
    },
    search: {
      enabled: true,
      iconSize: 18,
      showSubmitButton: true,
    },
    support: {
      enabled: true,
      iconSize: 24,
      showTextOnDesktop: true,
      phoneNumber: '+1 (999) 111-11-11',
      showDivider: true,
    },
    wishlist: {
      enabled: true,
      iconSize: 24,
      showTextOnDesktop: true,
    },
    account: {
      enabled: true,
      iconSize: 24,
      showTextOnDesktop: true,
    },
    cart: {
      enabled: true,
      iconSize: 24,
      showTextOnDesktop: true,
    },
  },
};
