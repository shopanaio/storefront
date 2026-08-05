# Shopana storefront workspace

This repository is a workspace orchestrator. The runnable application is the
`@shopana/brand-bite-crunch` theme package; the repository root does not own a
Next.js app.

## Packages

- `@shopana/storefront` — Next.js runtime CLI and framework facades.
- `@shopana/storefront-sdk` — shared storefront data/runtime API.
- `@shopana/checkout` — independent checkout flow and registration API.
- `@shopana/brand-sdk` — common theme contract.
- `@shopana/brand-bite-crunch` — full Bite & Crunch storefront application.

## Setup

```bash
yarn install
yarn --cwd mockServer install
cp packages/brand-bite-crunch/.env.sample packages/brand-bite-crunch/.env
```

Theme environment files are resolved from
`packages/brand-bite-crunch`, not from the workspace root.

## Commands

Root commands delegate to the runnable theme workspace:

```bash
yarn runtime:init
yarn dev
yarn build
yarn start
yarn codegen
yarn storybook
```

`runtime:init` generates
`packages/brand-bite-crunch/.runtime`. Generated runtime files must not be
edited directly.

The theme source uses the runtime's Next.js facades, for example:

```tsx
import Link from '@shopana/storefront/next/link';
import { usePathname } from '@shopana/storefront/next/navigation';
```

Checkout is composed by the theme adapter in
`src/integrations/checkout.tsx` and registered through the thin module adapter
in `src/modules/checkout/register.ts`.

## Adding another theme

Create a complete runnable theme package with its own `src`, `public`,
`codegen`, scripts, Storybook config, `next.config.js`, and runtime commands.
Theme selection is made by the workspace/build target; there is no dynamic
brand environment variable or fallback brand package.
