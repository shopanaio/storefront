import { createRuntimeLayout } from '@shopana/storefront-runtime/next/layout';

const { Layout } = createRuntimeLayout({
  loadLayout: async (pageType) => {
    if (pageType === '404') return null;
    return (await import('@src/layouts/theme')).default;
  },
});

export default Layout;
