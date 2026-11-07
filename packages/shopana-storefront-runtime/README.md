# @shopana/storefront

The runtime of a Shopana storefront: it generates the application of a theme for **Next.js**
(App Router) or **React Router** (framework mode, the React line of Remix) and runs its `dev`,
`build` and `start` commands. The theme code is the same under both; the package also owns the
framework facades that code imports.

## Framework

A theme picks its framework in its `package.json`; Next.js is the default:

```json
{
  "storefront": { "framework": "react-router" }
}
```

The CLI generates the app on every `dev` and `build`; `start` runs the existing build:

```bash
storefront-runtime init
storefront-runtime dev --port 3000      # Next.js: -p 3000 --turbo
storefront-runtime build
storefront-runtime start -p 3000
```

It creates `.runtime`, the app of the framework whose routes and adapters import the theme's
`src/` structures. `.runtime` is generated output and should not be edited or committed. A
custom `runtimeDir` passed to `initRuntime()` must resolve to a child directory of the
storefront root; the root itself and paths outside it are rejected before generated files are
removed. Generation removes the files of the other framework, so a theme can switch.

## Theme code

The theme keeps its customizable code under `src/`:

- `src/runtime/pages` contains the complete lazy reserved-page registry and definitions;
- `src/runtime/error.tsx` is the client error page rendered when a page fails (`error` and
  `reset` props);
- `src/layouts` contains page layouts (`src/layouts/theme` for every page but the 404 page);
- `src/templates` contains page templates;
- `src/modules/**/register.ts` contains dynamic module registrations;
- the root files of the framework (below).

Theme code reaches the framework only through the facades, which resolve to the implementation
of the runtime the app is built with (the `react-router` export condition, set by the generated
Vite config, selects React Router; Next.js is the default). Their types are one contract, which
both implementations are checked against:

```tsx
import dynamic from '@shopana/storefront/dynamic';
import Image from '@shopana/storefront/image';
import Link from '@shopana/storefront/link';
import {
  useRouter,
  usePathname,
  useSearchParams,
  useParams,
  notFound,
  redirect,
  NavigationScope,
} from '@shopana/storefront/navigation';
import {
  getRequestContext,
  headers,
  cookies,
} from '@shopana/storefront/headers';
import {
  useRuntimePageContent,
  PageNotFound,
} from '@shopana/storefront/page-client';
import { defineRuntimePage } from '@shopana/storefront/page-definition';
```

`Link` and `useRouter()` take a pathname without the locale segment, a named route
(`{ route: 'product', params: { handle } }`) or an absolute URL, and keep the active locale;
`usePathname()` returns the pathname without the locale segment and `useParams()` the
`locale` segment and the `slug` segments, under both runtimes. Inside a `NavigationScope`
neither router is involved: link clicks and router moves go to the scope's `onNavigate`.

Under React Router, `Image` is a plain `<img>` (no image optimizer): `fill`, `priority`,
`sizes` and a `blur` placeholder work, `quality` does nothing. `dynamic(loader, { ssr: false })`
renders `loading` on the server and during hydration.

Reserved page definitions use the contracts from `@shopana/storefront/page-definition`. Each
lazy module has a required default definition with a matching `pageType`. Definitions own data
loading, mapping, metadata, Providers, and typed template loading. The runtime supplies only
request context plus generic query services and validates page data before it is sent to the
browser in development. `generateMetadata` returns `RuntimeMetadata`: Next.js renders it as its
`Metadata`, React Router as `<meta>` and `<link>` tags.

## Search engines

Every page gets from the runtime what the site gives it, filled only where the page's
`RuntimeMetadata` leaves it out:

- the canonical address: the page's path without its query (`?sort=`, filters, `?variant=`),
  or the storefront path the page names in `alternates.canonical`; a `noindex` page has none
  unless it names one;
- the address of the page in each store language and `x-default` (indexable pages of a store
  with several languages);
- `og:url`, `og:site_name`, `og:locale` and `og:locale:alternate`, `og:type` (`website`),
  `og:title` and `og:description` from the page's own, and the Twitter card from them (a page
  without an image of its own keeps the root's card under React Router);
- the title in the app's template (`titleTemplate` of `src/runtime/app.ts` under React Router,
  `title.template` of the root layout under Next.js).

Addresses are absolute on the public origin: `STOREFRONT_PUBLIC_URL` (server environment, e.g.
`https://shop.example`), else the origin of the request. Set it in production: the request's
origin comes from its `Host` header, and a production server without it warns once. A page definition builds its own with
`context.site.url(path)` (a storefront path in the page's language) and `context.site.asset()`.
`openGraph.type` is `website`, `article` (with `openGraph.article`) or `product` (with
`openGraph.product`: price, availability, brand; Next.js gets them from the page as
`<meta property>` tags, outside its `Metadata`). `jsonLd` holds the page's schema.org documents
(a Product, a BreadcrumbList), rendered as `<script type="application/ld+json">` in the server's
page. A missing page answers `noindex`.

The theme's `src/runtime/seo.ts` defines `robots.txt` and the sitemaps; without it everything
is allowed and there is no sitemap:

```ts
// src/runtime/seo.ts
import { defineRuntimeSeo } from '@shopana/storefront/seo';

export default defineRuntimeSeo({
  // Storefront paths apply in every store language; `/*` patterns as they are. A page that
  // answers `noindex` stays crawlable: a crawler reads the `noindex` only on a page it may load.
  robots: { rules: [{ disallow: ['/embed/', '/*?*sort='] }] },
  sitemaps: {
    products: async ({ services }) => [
      { path: '/products/socks', lastModified: '2026-11-01', images: [] },
    ],
  },
});
```

The runtime serves `robots.txt` (with the `Sitemap:` line), `sitemap.xml` (an index) and
`sitemaps/<source>-<n>.xml`, each with up to 50 000 addresses: every entry in each store
language with the others as `xhtml:link` alternates, its images for image search; an empty
source has no file. The sources run in the store's default language, and the server keeps the
pages of each for ten minutes, which the index and the source's files share (crawlers read
them again after an hour).
A file of the theme's `public` at one of these addresses fails generation.

## Next.js

The theme provides:

- `src/config/routing.config.ts`, exporting `storefrontRouting` (`{ localePrefix }`): the
  middleware's locale routing, which the pages and the sitemaps build addresses with;
- `src/runtime/layout.tsx`, the root layout (a server component, with `generateMetadata`);
- `src/runtime/middleware.ts`, the runtime middleware created with the store languages:

```ts
// src/runtime/middleware.ts
import { createRuntimeMiddleware } from '@shopana/storefront/next/middleware';
import { storefrontRouting } from '@src/config/routing.config';

export default createRuntimeMiddleware({
  environmentConfig,
  routing: storefrontRouting,
});
```

It matches the first path segment against the store languages (cached for a minute), applies
next-intl locale routing and passes the request URL and locale to server rendering.

The generator accepts only these optional files at the storefront root:

- one of `next.config.js`, `next.config.mjs`, or `next.config.ts`;
- one of `middleware.js`, `middleware.ts`, `proxy.js`, or `proxy.ts`;
- one of `instrumentation.js` or `instrumentation.ts`;
- one of `instrumentation-client.js` or `instrumentation-client.ts`.

An override fully replaces its runtime default. The generated wrapper imports the root file, so
imports written relative to that file continue to resolve from the storefront root. Conflicting
variants fail generation with a diagnostic. `next/page`, `next/layout`, `next/not-found`,
`next/middleware`, `next/auth` and `next/auth-headless` are the route implementations of the
generated app.

## Static site (React Router)

A theme with `static.config.ts` (`defineStaticSite` of `@shopana/storefront-sdk/static`) gets
its pages rendered ahead of time, as a guest, from the server build:

```bash
storefront-runtime build
storefront-runtime static build              # into .runtime/build/static
storefront-runtime static render /uk/products/x /categories/y
storefront-runtime static publish --from fs:.runtime/build/static --to s3://bucket/site
storefront-runtime start                     # static pages as hits, the rest rendered
storefront-runtime start --static-only       # no server render: family shells and 404.html
```

The builder renders with the `x-shopana-static-render` header and the key of its own process
(`staticRenderHeaders`; a request from outside is never a static render): the whole document
at once, no cookie (no cart, session or visitor id), client pages (`shells`) as their layout and the
theme's skeleton (`src/runtime/shell.tsx`), emotion rules the page does not use dropped,
`window.__shopanaStatic` in the head. It writes each page's HTML and its Apollo state
(`__static/data/*.json`), the family shells (`__shell/*.html`), `404.html`, `robots.txt`, the
sitemaps, the build's assets, `__static/manifest.json` (hashes, entities, `validUntil`) and its
small index for the server, `__static/server.json`. A page whose content did not change keeps
its file; one that failed keeps its earlier files; a file the new manifest does not list (a
page that left the catalog, its data) is deleted at once, an asset of an earlier build a week
later. The manifest is written only over the version the writer read, so a full build and a
`static render` at the same time keep each other's pages. Requests go to the API of
`STOREFRONT_SERVER_GRAPHQL_URL` (else `NEXT_PUBLIC_GRAPHQL_URL`), the static renders with
`STOREFRONT_PRIVATE_TOKEN`; `STOREFRONT_PUBLIC_URL` is the origin pages are rendered for.

`start` is the runtime's own server (`express` and `@react-router/express`): the browser
build, `/__env.js` (the public settings of its environment, which every document loads), the
static site of `STOREFRONT_STATIC_STORE` (`s3://<bucket>/<prefix>` with
`STOREFRONT_STATIC_S3_ENDPOINT`, `STOREFRONT_STATIC_S3_ACCESS_KEY_ID`,
`STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY`, read through a memory cache checked again after
`STOREFRONT_STATIC_CACHE_TTL` seconds; or `fs:<dir>`), else `build/static` when it has an
index, and the server render for everything else (`x-shopana-static: hit | miss`). An address
whose query string has a parameter other than campaign and analytics ones (`sort`, `filter.*`,
`variant`) is rendered by the server. A store that fails is a miss, never an error of the site;
a bucket that failed is left alone for a while (2 s up to a minute) instead of being waited for.
With `STOREFRONT_STATIC_COORDINATOR_URL` (and its token `STOREFRONT_STATIC_COORDINATOR_TOKEN`),
the server reports to the builder's coordinator every 30 s how often each static page was served
and which pages of a generated family it rendered without a file (`POST /__builder/api/hits`).

A client navigation of a static document renders at once, as from the API, and its queries
take their answers from the static data of the address (`/__static/data/*.json`) when it has
them, for the page types the builder rendered: a query the data lacks, an answer that would
change what the cache holds, and a signed-in buyer's viewer fields go to the API.

## React Router

The generated app has a root route, a layout route that renders the layout of the page type
(`[[...slug]]/layout` of the Next.js app), the home page and a `*` page route under it, and the
session routes. The theme provides:

- `src/runtime/app.ts`, the storefront of the app: what Next.js reads from the middleware and
  `AppProvider` props;
- `src/runtime/layout.tsx`, the document: `<html>` with `Meta`, `Links`, the app in
  `AppProvider` and `Scripts`, plus optional `meta` and `links` for every page;
- optionally `src/runtime/route-middleware.ts`, React Router middleware run after the
  runtime's (`src/runtime/middleware.ts` stays the Next.js middleware);
- optionally `src/runtime/seo.ts`, the robots rules and sitemaps (see "Search engines").

```ts
// src/runtime/app.ts
import { defineRuntimeApp } from '@shopana/storefront/react-router/app';

export default defineRuntimeApp({
  environmentConfig,
  routing: { localePrefix: 'as-needed' },
  cartConfig,
  preload: { navigationMenus: ['main-menu', 'footer-menu'] },
  // A page's title with the store in it; a page without one has the layout's title.
  titleTemplate: (title, store) => `${title} — ${store.name}`,
});
```

```tsx
// src/runtime/layout.tsx
import {
  AppProvider,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRuntimeApp,
} from '@shopana/storefront/react-router/document';

export const meta = () => [{ title: 'Store' }];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const app = useRuntimeApp();
  return (
    <html lang={app?.locale.tag}>
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

```ts
// src/runtime/route-middleware.ts (optional)
import type { RuntimeMiddleware } from '@shopana/storefront/react-router/server';

const middleware: RuntimeMiddleware[] = [];
export default middleware;
```

What the runtime does, as the Next.js app does:

- the root middleware matches the locale segment against the store languages (cached for a
  minute), redirects an address to its `localePrefix` form (307), and runs the request in a
  request scope with the storefront locale header, which the SDK server modules read
  (`runtimeRequestLocale` is the matched locale for later middleware and loaders);
- the root loader returns `loadAppProps()` of the SDK (store, languages, cart, session,
  preloaded menus) without its cache snapshot, and the public origin; it runs with the document and again only after a
  form submission or for another locale. `AppProvider` renders the SDK providers over a plain
  `ApolloProvider`, which on the server is the request client of the loaders;
- the page loader resolves the address to a module page or a reserved page, runs `loadData`
  and `preload` with the request client, computes the metadata, and answers a missing page with
  the theme's 404 page (in the 404 layout) and status 404. The page renders under its layout,
  which stays mounted between pages;
- the loaders send no cache of their own: their queries stay in the request client, and the
  document carries the cache that client ended the server render with (the loaders' queries
  and those the sections ran while rendering) before `</body>`. The browser's client starts
  from it, so hydration queries nothing again. A Suspense boundary whose content is ready goes out in
  place (no fallback first, whatever its size: `progressiveChunkSize` is unlimited), so a page in
  a boundary (a mobile app screen) paints at once; the price is a larger first chunk, as a
  large ready boundary is no longer sent after the shell. The render reads its request through React
  (`useServerRequestHeaders` of `@shopana/storefront-sdk/core/ServerRequestScope`), which work React resumes after a
  suspension keeps;
- after hydration the app is a single-page app: a client navigation asks the server nothing.
  The page's loader runs in the browser: it resolves the address, loads the page's modules
  and layout and runs `loadData` with the app's Apollo client (`preload` stays on the server;
  the sections load their queries under their skeletons). The metadata is computed while the
  page shows and then put into the document (title and `<meta>` tags). A page closed to
  visitors without a session is left to its browser guard;
- `notFound()` and `PageNotFound` while rendering end in the 404 page under the page's layout,
  with status 404 when the server renders it before the response (always for crawlers and
  `HEAD`; content streamed later shows it in the browser with `noindex`); `redirect()` answers
  an HTTP redirect, or the browser follows it; any other error renders
  `src/runtime/error.tsx` (`reset` loads the data again) under the layout of the address;
- module pages are plain components (not async server components) and render on the server
  and in the browser, with page services over the Apollo client of the page.

The generator accepts these optional files at the storefront root: one of `vite.config.js`,
`vite.config.mjs` or `vite.config.ts`, and one of `react-router.config.js` or
`react-router.config.ts`. A Vite override builds on the runtime config:

```ts
// vite.config.ts
import { createRuntimeViteConfig } from '@shopana/storefront/react-router/vite';

export default createRuntimeViteConfig({
  config: { ssr: { noExternal: ['swiper'] } },
});
```

The Vite config makes the theme package the source root (`@src`, `@codegen`, `public`, `.env`
files). React Router reads `NEXT_PUBLIC_*` and `PUBLIC_*` settings at runtime and sends their
values in the SSR document before client modules execute. Build-time keys and URLs are never
inlined. The client reads the runtime public environment; all other server settings stay private.
`start` reads the theme's `.env` files for the server. Key rotation or a URL change requires a
container restart/rolling update, not a rebuild.

## Customer sessions

Both apps mount the customer session handlers (BFF) at `/auth/[action]`: `login`, `callback`,
`token`, `refresh` and `logout`, and the headless sign-in handlers at
`/auth/headless/[action]`. The storefront is a confidential IAM OAuth client: the code is
exchanged on the server with the client secret, and the tokens stay in encrypted HttpOnly
cookies. The handlers read the server environment:

- `NEXT_PUBLIC_IAM_URL`, `NEXT_PUBLIC_IAM_APPLICATION_ID` (also used by the browser);
- `IAM_OAUTH_CLIENT_ID`, `IAM_OAUTH_CLIENT_SECRET`, `IAM_OAUTH_RESOURCE`;
- `IAM_OAUTH_REDIRECT_URI`, the registered `{origin}/auth/callback`;
- `IAM_OAUTH_POST_LOGOUT_REDIRECT_URI` (optional; sign-out then ends the IAM session);
- `STOREFRONT_SESSION_SECRET`, at least 32 characters, the cookie encryption key;
- `STOREFRONT_COOKIE_POLICY` (optional, `first-party` by default): `embedded` for a storefront
  shown in a third-party iframe, the same value as `environmentConfig.cookiePolicy`;
- `STOREFRONT_TRUSTED_PROXY_HOPS` (optional, 1 by default), the number of proxies in front of
  the storefront that append to `X-Forwarded-For`. The buyer address sent to IAM is the entry
  this many hops from the right; entries the client added further left are ignored.

Under React Router the CLI preloads into the dev server and the server of `start` what Next.js
does itself: a request that reached the storefront directly, with no proxy in front, gets
`X-Forwarded-For` from its connection; a forwarded one keeps the header its proxies wrote.
A request with the header set is taken as forwarded, so a storefront open to the internet
with no proxy in front trusts whatever address a client writes there: in production it runs
behind the proxies `STOREFRONT_TRUSTED_PROXY_HOPS` counts.

The locale routing leaves `/auth/*` to these handlers.
