import { createRuntimePage } from '@shopana/storefront-runtime/next/page';
import { environmentConfig } from '@src/config/environment.config';

const { Page, generateMetadata } = createRuntimePage({
  environmentConfig,
  modulesContext: require.context(
    '../../../../src/modules',
    true,
    /register\.(t|j)sx?$/
  ),
  loadTemplate: async (pageType) => {
    switch (pageType) {
      case 'home':
        return (await import('@src/templates/index/index')).default;
      case 'product':
        return (await import('@src/templates/product/index')).default;
      case 'collection':
        return (await import('@src/templates/collection/index')).default;
      case 'search':
        return (await import('@src/templates/search/index')).default;
      case 'blog':
        return (await import('@src/templates/blog/index')).default;
      case 'article':
        return (await import('@src/templates/article/index')).default;
      case 'page':
        return (await import('@src/templates/page/index')).default;
      case 'cart':
        return (await import('@src/templates/cart/index')).default;
      case 'list-collections':
        return (await import('@src/templates/list-collections/index')).default;
      case '404':
        return (await import('@src/templates/404/index')).default;
      default:
        return null;
    }
  },
});

export default Page;
export { generateMetadata };
