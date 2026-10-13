# Theme package contract

The storefront is composed as a complete theme workspace. Bite & Crunch is the
current runnable theme: `@shopana/brand-bite-crunch`.

A theme package owns:

- application source (`src`), layouts, templates, UI kit and integrations;
- static assets (`public`);
- GraphQL documents and generated theme operations (`codegen`);
- Storybook and widget scripts;
- the root `next.config.js` override;
- its generated `.runtime` directory.

The workspace root chooses a theme by delegating to its package name. Runtime
brand switching and compatibility aliases are intentionally unsupported.

## Required scripts

Every runnable theme exposes `runtime:init`, `dev`, `build`, `start`, `codegen`,
`widgets:build`, and `storybook`.

## Runtime integration

The runtime CLI is executed with the theme package as its working directory:

```bash
yarn workspace @shopana/brand-bite-crunch runtime:init
```

This creates `packages/brand-bite-crunch/.runtime`; `@src` and `@codegen`
resolve against that same package.

## Checkout integration

Themes implement `CheckoutThemeAdapter`, bind it in a theme-owned checkout page,
and pass that page loader to `registerCheckoutModule`. The checkout package does
not import theme source or theme aliases.

## Creating a theme

Copy the complete theme package contract, assign a new workspace package name,
provide its config and composition adapters, and point deployment/root delegate
scripts at that workspace. Do not add a logo-only package or a runtime fallback
branch.
