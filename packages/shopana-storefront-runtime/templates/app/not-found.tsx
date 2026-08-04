import { createRuntimeNotFound } from '@shopana/storefront-runtime/next/not-found';

const { NotFound } = createRuntimeNotFound({
  loadTemplate: async () => (await import('@src/templates/404/index')).default,
});

export default NotFound;
