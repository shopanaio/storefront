import { registerTemplates } from './core/template-registry';
import { cartTemplate, collectionTemplate, homeTemplate, productTemplate, staticPageTemplate } from './templates';
import {
  getCartPageData,
  getCollectionPageData,
  getHomePageData,
  getProductPageData,
  getStaticPageData,
} from './sdk/server';

export function registerDefaultTemplates() {
  registerTemplates({
    home: {
      template: homeTemplate,
      loadData: () => getHomePageData(),
    },
    product: {
      template: productTemplate,
      loadData: ({ params }) => getProductPageData(params.handle ?? 'demo-product'),
    },
    collection: {
      template: collectionTemplate,
      loadData: ({ params }) => getCollectionPageData(params.handle ?? 'demo-collection'),
    },
    page: {
      template: staticPageTemplate,
      loadData: ({ params }) => getStaticPageData(params.handle ?? 'about'),
    },
    cart: {
      template: cartTemplate,
      loadData: () => getCartPageData(),
    },
  });
}
