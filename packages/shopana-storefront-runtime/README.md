# @shopana/storefront

Generated Next.js App Router runtime for a Shopana storefront. This package
owns the Next.js dependency, the generated application, its default
configuration, and the `dev`, `build`, and `start` commands.

The package owns the framework route implementations and the `init` generator.
The consuming storefront keeps its customizable code under `src/`:

- `src/runtime/layout.tsx` and `src/runtime/middleware.ts` provide app-level integration;
- `src/runtime/error.tsx` is the client error page rendered when a page fails (`error` and `reset` props);
- `src/runtime/pages` contains the complete lazy reserved-page registry and definitions;
- `src/layouts` contains page layouts;
- `src/templates` contains page templates;
- `src/modules/**/register.ts` contains dynamic module registrations.

The CLI generates automatically for development and builds, while `start` uses
the existing generated application:

```bash
storefront-runtime init
storefront-runtime dev -p 3000 --turbo
storefront-runtime build --turbo
storefront-runtime start
```

It creates `.runtime`, including the Next `app` routes and adapters that import
the storefront structures above. `.runtime` is generated output and should not
be edited or committed. A custom `runtimeDir` passed to `initRuntime()` must
resolve to a child directory of the storefront root; the root itself and paths
outside it are rejected before generated files are removed.

The generator accepts only these optional files at the storefront root:

- one of `next.config.js`, `next.config.mjs`, or `next.config.ts`;
- one of `middleware.js`, `middleware.ts`, `proxy.js`, or `proxy.ts`;
- one of `instrumentation.js` or `instrumentation.ts`;
- one of `instrumentation-client.js` or `instrumentation-client.ts`.

An override fully replaces its runtime default. The generated wrapper imports
the root file, so imports written relative to that file continue to resolve from
the storefront root. Conflicting variants fail generation with a diagnostic.

The generated app also mounts the customer session handlers (BFF) at
`/auth/[action]`: `login`, `callback`, `token`, `refresh` and `logout`. The
storefront is a confidential IAM OAuth client: the code is exchanged on the
server with the client secret, and the tokens stay in encrypted HttpOnly
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

The default middleware matcher leaves `/auth/*` to these handlers.

Storefront source should consume framework APIs through the runtime facade:

```tsx
import dynamic from '@shopana/storefront/next/dynamic';
import Image from '@shopana/storefront/next/image';
import Link from '@shopana/storefront/next/link';
import { useRouter } from '@shopana/storefront/next/navigation';
```

`Link` and `useRouter()` take a pathname without the locale segment, a named route
(`{ route: 'product', params: { handle } }`) or an absolute URL, and keep the active locale;
`usePathname()` returns the pathname without the locale segment.

The theme middleware is created with the store languages as locales:

```ts
// src/runtime/middleware.ts
export default createRuntimeMiddleware({
  environmentConfig,
  routing: { localePrefix: 'as-needed' },
});
```

It matches the first path segment against the store languages (cached for a minute), applies
next-intl locale routing and passes the request URL and locale to server rendering.

The `next/headers`, `next/middleware`, `next/page`, `next/layout`, and `next/not-found` exports
remain available. `next/headers` and `next/middleware` also expose the corresponding public
Next.js primitives.

Reserved page definitions use the contracts from
`@shopana/storefront/next/page-definition`. Each lazy module has a required
default definition with a matching `pageType`. Definitions own data loading,
mapping, metadata, Providers, and typed template loading. The runtime supplies
only request context plus generic query services and validates page data before
it crosses the RSC boundary in development.
