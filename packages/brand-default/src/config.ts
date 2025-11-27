import type { BrandConfig } from '@shopana/brand-sdk';
import { DefaultLogo } from './components/Logo';

/**
 * Default Shopana brand configuration
 */
export const brandConfig: BrandConfig = {
  components: {
    logo: DefaultLogo,
  },
  theme: {
    colorPrimary: '#14CC80',
  },
  ui: {
    drawerEngine: 'antd',
  },
};
