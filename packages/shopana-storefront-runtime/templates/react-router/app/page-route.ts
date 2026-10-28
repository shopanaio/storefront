import type { RuntimePageRouteDefinition } from '@shopana/storefront/react-router/page';
import { runtimePages } from '@src/runtime/pages';

// Module registrations run on the server and in the browser.
import.meta.glob('../../src/modules/**/register.{ts,tsx,js,jsx}', {
  eager: true,
});

export const pageRoute: RuntimePageRouteDefinition = {
  pages: runtimePages,
  loadLayout: async (pageType, { isModule }) => {
    if (pageType === '404' && !isModule) return null;
    return (await import('@src/layouts/theme')).default;
  },
};
