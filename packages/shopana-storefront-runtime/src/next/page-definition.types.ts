import type { PageTemplate } from '@shopana/storefront-sdk/core/types';
import {
  defineRuntimeNotFound,
  defineRuntimePage,
  defineRuntimePages,
  type RuntimePageProviderProps,
} from './page-definition';

const stringTemplate: PageTemplate<string> = {
  sections: { order: [] },
};
const numberTemplate: PageTemplate<number> = {
  sections: { order: [] },
};

function NumberProvider({ children }: RuntimePageProviderProps<number>) {
  return children;
}

const home = defineRuntimePage({
  pageType: 'home',
  loadData: async () => ({ status: 'ready', data: 'home' }),
  loadTemplate: async () => stringTemplate,
});
const product = defineRuntimePage({
  pageType: 'product',
  loadData: async () => ({ status: 'ready', data: null }),
  loadTemplate: async () => ({ sections: { order: [] } }),
});
const collection = defineRuntimePage({
  pageType: 'collection',
  loadData: async () => ({ status: 'ready', data: null }),
  loadTemplate: async () => ({ sections: { order: [] } }),
});
const search = defineRuntimePage({
  pageType: 'search',
  loadData: async () => ({ status: 'ready', data: null }),
  loadTemplate: async () => ({ sections: { order: [] } }),
});
const blog = defineRuntimePage({
  pageType: 'blog',
  loadData: async () => ({ status: 'ready', data: null }),
  loadTemplate: async () => ({ sections: { order: [] } }),
});
const article = defineRuntimePage({
  pageType: 'article',
  loadData: async () => ({ status: 'ready', data: null }),
  loadTemplate: async () => ({ sections: { order: [] } }),
});
const page = defineRuntimePage({
  pageType: 'page',
  loadData: async () => ({ status: 'ready', data: null }),
  loadTemplate: async () => ({ sections: { order: [] } }),
});
const cart = defineRuntimePage({
  pageType: 'cart',
  loadData: async () => ({ status: 'ready', data: null }),
  loadTemplate: async () => ({ sections: { order: [] } }),
});
const listCollections = defineRuntimePage({
  pageType: 'list-collections',
  loadData: async () => ({ status: 'ready', data: null }),
  loadTemplate: async () => ({ sections: { order: [] } }),
});
const notFound = defineRuntimeNotFound({
  pageType: '404',
  loadData: async () => null,
  loadTemplate: async () => ({ sections: { order: [] } }),
});

const validModules = {
  home: async () => ({ default: home }),
  product: async () => ({ default: product }),
  collection: async () => ({ default: collection }),
  search: async () => ({ default: search }),
  blog: async () => ({ default: blog }),
  article: async () => ({ default: article }),
  page: async () => ({ default: page }),
  cart: async () => ({ default: cart }),
  'list-collections': async () => ({ default: listCollections }),
  '404': async () => ({ default: notFound }),
};

defineRuntimePages(validModules);

// @ts-expect-error every reserved key is required
defineRuntimePages({
  home: validModules.home,
  product: validModules.product,
  collection: validModules.collection,
  search: validModules.search,
  blog: validModules.blog,
  article: validModules.article,
  page: validModules.page,
  cart: validModules.cart,
  'list-collections': validModules['list-collections'],
});

// @ts-expect-error extra registry keys are forbidden
defineRuntimePages({ ...validModules, extra: validModules.home });

defineRuntimePages({
  ...validModules,
  // @ts-expect-error registry key and definition pageType must match
  product: async () => ({ default: home }),
});

defineRuntimePages({
  ...validModules,
  // @ts-expect-error a lazy module requires a branded default definition
  home: async () => ({ default: { pageType: 'home' as const } }),
});

defineRuntimePage<'home', string>({
  pageType: 'home',
  loadData: async () => ({ status: 'ready', data: 'home' }),
  loadTemplate: async () => stringTemplate,
  // @ts-expect-error Provider data must match loadData
  Provider: NumberProvider,
});

defineRuntimePage<'home', string>({
  pageType: 'home',
  loadData: async () => ({ status: 'ready', data: 'home' }),
  // @ts-expect-error template data must match loadData
  loadTemplate: async () => numberTemplate,
});
