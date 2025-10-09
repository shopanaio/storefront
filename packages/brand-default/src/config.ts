import { ComponentType } from 'react';
import { DefaultLogo } from './components/Logo';

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
 * Default Shopana brand configuration
 */
export const brandConfig: BrandConfig = {
  components: {
    logo: DefaultLogo,
  },
  theme: {
    // Uses default Ant Design primary color
  },
};
