import type { TypedDocumentNode } from '@apollo/client';
import { parse } from 'graphql';
import {
  RouterContextProvider,
  type LoaderFunctionArgs,
  type MiddlewareFunction,
} from 'react-router';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { PageNotFoundError } from '@shopana/storefront-sdk/core/PageNotFoundError';
import { registerModule } from '@shopana/storefront-sdk/registry';
import {
  defineRuntimeNotFound,
  defineRuntimePage,
  type RuntimePageModuleMap,
} from '../core/page-definition';
import { getRequestContext } from './headers';
import type { RuntimePageData } from './route-data';
import { createRuntimeMiddleware, createRuntimePageLoader } from './server';

const app = {
  environmentConfig: {
    graphqlUrl: 'https://api.test/graphql',
    apiKeyHeader: 'x-api-key',
    apiKey: 'key',
  },
  routing: { localePrefix: 'as-needed' as const },
  cartConfig: { channelCode: 'online-store' },
};

// A test document: the page queries of a theme come from its codegen.
const ProductQuery = parse(
  'query TestProduct($handle: String!) { productByHandle(handle: $handle) { id handle title } }'
) as TypedDocumentNode<
  {
    productByHandle: {
      __typename: 'Product';
      id: string;
      handle: string;
      title: string;
    } | null;
  },
  { handle: string }
>;

/** The storefront API: the store languages and the products `socks`. */
function stubApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_input: unknown, init: RequestInit = {}) => {
      const body = JSON.parse(String(init.body));
      if (body.operationName === 'SdkStorefrontLocales') {
        return Response.json({
          data: {
            store: { id: 'store', defaultLocale: 'en', locales: ['en', 'uk'] },
          },
        });
      }
      const handle = body.variables?.handle;
      return Response.json({
        data: {
          productByHandle:
            handle === 'socks'
              ? { __typename: 'Product', id: 'p1', handle, title: 'Socks' }
              : null,
        },
      });
    })
  );
}

const home = defineRuntimePage({
  pageType: 'home',
  loadData: (context) =>
    context.searchParams.gone
      ? (() => {
          throw new PageNotFoundError();
        })()
      : { status: 'ready', data: { home: true } },
  loadTemplate: async () => ({ sections: { order: [] } }),
  generateMetadata: () => ({ title: 'Home' }),
});

const product = defineRuntimePage<'product', { handle: string }>({
  pageType: 'product',
  loadData: (context) => ({
    status: 'ready',
    data: { handle: context.routeParams.handle ?? '' },
  }),
  async preload(context, data) {
    const result = await context.services.loadQuery(ProductQuery, data);
    return result.data.productByHandle
      ? { status: 'ready', data }
      : { status: 'not-found' };
  },
  loadTemplate: async () => ({ sections: { order: [] } }),
});

const notFound = defineRuntimeNotFound({
  pageType: '404',
  loadData: async (context) => ({ missing: context.request.pathname }),
  loadTemplate: async () => ({ sections: { order: [] } }),
});

const pages = {
  home: async () => ({ default: home }),
  product: async () => ({ default: product }),
  '404': async () => ({ default: notFound }),
} as unknown as RuntimePageModuleMap;

const middleware = createRuntimeMiddleware(app);
const loader = createRuntimePageLoader(app, {
  pages,
  loadLayout: async () => null,
});

/** A request through the runtime middleware into `handler`, as React Router runs it. */
async function request<T>(
  href: string,
  handler: (args: LoaderFunctionArgs) => Promise<T>
): Promise<T> {
  const url = new URL(href, 'https://shop.test');
  const args = {
    request: new Request(url, { headers: { host: 'shop.test' } }),
    url,
    params: {},
    pattern: '*',
    context: new RouterContextProvider(),
  } as unknown as LoaderFunctionArgs;
  return (middleware as unknown as MiddlewareFunction<T>)(args, () =>
    handler(args)
  ) as Promise<T>;
}

const load = (href: string) =>
  request(href, (args) => loader(args)) as Promise<
    RuntimePageData | { data: RuntimePageData; init: ResponseInit | null }
  >;

async function thrown(promise: Promise<unknown>): Promise<Response> {
  try {
    await promise;
  } catch (error) {
    return error as Response;
  }
  throw new Error('Expected a thrown response');
}

beforeAll(() => {
  registerModule({
    type: 'page',
    slug: 'test-module',
    path: '/test-module{/:id}',
    loader: async () => ({
      default: () => null,
      generateMetadata: ({ pathParams }: { pathParams: { id?: string } }) => ({
        title: `Module ${pathParams.id}`,
      }),
    }),
  });
  registerModule({
    type: 'page',
    slug: 'test-account',
    path: '/test-account',
    access: { session: 'required' },
    loader: async () => ({ default: () => null }),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('createRuntimeMiddleware', () => {
  it('sends an address to its locale prefix form', async () => {
    stubApi();
    const response = await thrown(
      request('/en/products/socks?size=m', async () => null)
    );
    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toBe('/products/socks?size=m');
  });

  it('runs the request in a scope with the request address', async () => {
    stubApi();
    const context = await request('/uk/products/socks?size=m', () =>
      getRequestContext()
    );
    expect(context).toMatchObject({
      pathname: '/uk/products/socks',
      search: '?size=m',
      host: 'shop.test',
    });
  });
});

describe('createRuntimePageLoader', () => {
  it('loads a reserved page and its metadata', async () => {
    stubApi();
    await expect(load('/')).resolves.toEqual({
      kind: 'page',
      pageType: 'home',
      data: { home: true },
      metadata: { title: 'Home' },
    });
  });

  it('runs the preload and sends no cache with the page: the document carries it', async () => {
    stubApi();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const page = (await load('/uk/products/socks')) as RuntimePageData;
    expect(page).toMatchObject({ kind: 'page', data: { handle: 'socks' } });
    expect(page).not.toHaveProperty('cacheState');
  });

  it('answers a page its preload or a PageNotFoundError finds missing with the 404 page', async () => {
    stubApi();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    for (const href of ['/products/boots', '/?gone=1', '/nope/at/all']) {
      const result = (await load(href)) as {
        data: RuntimePageData;
        init: ResponseInit | null;
      };
      expect(result.init?.status).toBe(404);
      expect(result.data).toMatchObject({
        kind: 'not-found',
        data: { missing: new URL(href, 'https://shop.test').pathname },
      });
    }
  });

  it('loads a module page with its params and metadata', async () => {
    stubApi();
    await expect(load('/uk/test-module/7?q=1')).resolves.toEqual({
      kind: 'module',
      slug: 'test-module',
      pathname: '/test-module/7',
      props: {
        params: { locale: 'uk', module: ['test-module', '7'] },
        searchParams: { q: '1' },
        pathParams: { id: '7' },
      },
      closedPageRedirect: null,
      metadata: { title: 'Module 7' },
    });
  });

  it('sends a visitor without a session from a closed page to the home page', async () => {
    stubApi();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = await thrown(load('/uk/test-account'));
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/uk');
  });
});
