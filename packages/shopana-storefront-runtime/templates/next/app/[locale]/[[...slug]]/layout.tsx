import { createRuntimeLayout } from '@shopana/storefront/next/layout';

const { Layout } = createRuntimeLayout({
  modulesContext: require.context(
    '../../../../src/modules',
    true,
    /register\.(t|j)sx?$/
  ),
  loadLayout: async (pageType, { isModule }) => {
    if (pageType === '404' && !isModule) return null;
    return (await import('@src/layouts/theme')).default;
  },
});

export default Layout;
