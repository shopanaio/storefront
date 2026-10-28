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

## Next.js

The theme provides:

- `src/runtime/layout.tsx`, the root layout (a server component, with `generateMetadata`);
- `src/runtime/middleware.ts`, the runtime middleware created with the store languages:

```ts
// src/runtime/middleware.ts
import { createRuntimeMiddleware } from '@shopana/storefront/next/middleware';

export default createRuntimeMiddleware({
  environmentConfig,
  routing: { localePrefix: 'as-needed' },
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

## React Router

The generated app has a root route, a layout route that renders the layout of the page type
(`[[...slug]]/layout` of the Next.js app), the home page and a `*` page route under it, and the
session routes. The theme provides:

- `src/runtime/app.ts`, the storefront of the app: what Next.js reads from the middleware and
  `AppProvider` props;
- `src/runtime/layout.tsx`, the document: `<html>` with `Meta`, `Links`, the app in
  `AppProvider` and `Scripts`, plus optional `meta` and `links` for every page;
- optionally `src/runtime/route-middleware.ts`, React Router middleware run after the
  runtime's (`src/runtime/middleware.ts` stays the Next.js middleware).

```ts
// src/runtime/app.ts
import { defineRuntimeApp } from '@shopana/storefront/react-router/app';

export default defineRuntimeApp({
  environmentConfig,
  routing: { localePrefix: 'as-needed' },
  cartConfig,
  preload: { navigationMenus: ['main-menu', 'footer-menu'] },
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
  preloaded menus) without its cache snapshot; it runs with the document and again only after a
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
files) and inlines the `NEXT_PUBLIC_*` and `PUBLIC_*` variables into both builds, as Next.js
does, so the storefront config reads the same names under both runtimes; `start` reads the
theme's `.env` files for the server.

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

Under React Router the CLI preloads into the dev server and `react-router-serve` what Next.js
does itself: a request that reached the storefront directly, with no proxy in front, gets
`X-Forwarded-For` from its connection; a forwarded one keeps the header its proxies wrote.
A request with the header set is taken as forwarded, so a storefront open to the internet
with no proxy in front trusts whatever address a client writes there: in production it runs
behind the proxies `STOREFRONT_TRUSTED_PROXY_HOPS` counts.

The locale routing leaves `/auth/*` to these handlers.
