import { ComponentType } from 'react';

/**
 * Logo component props interface
 */
export interface LogoProps {
  noText?: boolean;
  theme?: 'dark' | 'light';
  size: number;
  color?: string;
  textColor?: string;
}

/** Global brand colors available to every theme color scheme. */
export interface ColorPalette extends Record<string, string> {
  primary: string;
  secondary: string;
}

/** Shopify-inspired semantic colors applied to a section or component. */
export interface ColorScheme {
  background: {
    solid: string;
    gradient?: string;
  };
  text: string;
  accent: string;
  links: string;
  icons: string;
  primaryButton: {
    background: string;
    text: string;
    border: string;
  };
  secondaryButton: {
    background: string;
    text: string;
    border: string;
  };
  shadow: string;
}

export interface ColorSettings {
  /** Reusable brand colors exposed by name. */
  palette: ColorPalette;
  /** Color schemes selectable by sections and components. */
  schemes: Record<string, ColorScheme>;
  /** Key of the scheme used when no local scheme is selected. */
  defaultScheme: string;
}

/** Store-wide theme settings, equivalent to Shopify general theme settings. */
export interface GeneralSettings {
  colors: ColorSettings;
}

/**
 * Brand configuration interface
 */
export interface BrandConfig {
  components: {
    logo: ComponentType<LogoProps>;
  };
  generalSettings: GeneralSettings;
  ui?: {
    /** Drawer engine to use across UI */
    drawerEngine?: 'antd' | 'vaul';
  };
}
