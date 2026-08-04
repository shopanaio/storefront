# @shopana/storefront

Generated Next.js App Router runtime for a Shopana storefront. This package
owns the Next.js dependency, the generated application, its default
configuration, and the `dev`, `build`, and `start` commands.

The package owns the framework route implementations and the `init` generator.
The consuming storefront keeps its customizable code under `src/`:

- `src/runtime/layout.tsx` and `src/runtime/middleware.ts` provide app-level integration;
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
be edited or committed.

The generator accepts only these optional files at the storefront root:

- one of `next.config.js`, `next.config.mjs`, or `next.config.ts`;
- one of `middleware.js`, `middleware.ts`, `proxy.js`, or `proxy.ts`;
- one of `instrumentation.js` or `instrumentation.ts`;
- one of `instrumentation-client.js` or `instrumentation-client.ts`.

An override fully replaces its runtime default. The generated wrapper imports
the root file, so imports written relative to that file continue to resolve from
the storefront root. Conflicting variants fail generation with a diagnostic.

Storefront source should consume framework APIs through the runtime facade:

```tsx
import dynamic from '@shopana/storefront/next/dynamic';
import Image from '@shopana/storefront/next/image';
import Link from '@shopana/storefront/next/link';
import { useRouter } from '@shopana/storefront/next/navigation';
```

The existing `next/headers`, `next/middleware`, `next/page`, `next/layout`, and
`next/not-found` exports remain available. `next/headers` and `next/middleware`
also expose the corresponding public Next.js primitives.
