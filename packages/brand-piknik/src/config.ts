import { ComponentType } from 'react';
import { PiknikLogo } from './components/Logo';

/**
 * Logo component props interface
 */
export interface LogoProps {
  noText?: boolean;
  theme?: 'dark' | 'light';
  size: number;
  color?: string;
}

/**
 * Brand configuration interface
 */
export interface BrandConfig {
  components: {
    logo: ComponentType<LogoProps>;
  };
  theme: {
    colorPrimary?: string;
  };
}

/**
 * Piknik brand configuration
 */
export const brandConfig: BrandConfig = {
  components: {
    logo: PiknikLogo,
  },
  theme: {
    colorPrimary: '#00b576',
  },
};
