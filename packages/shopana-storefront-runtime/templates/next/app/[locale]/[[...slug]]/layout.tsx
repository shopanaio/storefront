import { createRuntimeLayout } from '@shopana/storefront/next/layout';

const { Layout } = createRuntimeLayout({
  modulesContext: require.context(
    '../../../../src/modules',
    true,
    /register\.(t|j)sx?$/
  ),
  loadLayout: async () => (await import('@src/layouts/theme')).default,
});

export default Layout;
