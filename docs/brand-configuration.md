# Theme package contract

The storefront is composed as a complete theme workspace. Themes live in their
own repositories and are checked out under `themes/<name>` (see
`themes/README.md`).

A theme package owns:

- application source (`src`), layouts, templates, UI kit and integrations;
- static assets (`public`);
- GraphQL documents and generated theme operations (`codegen`);
- Storybook and widget scripts;
- its framework (`storefront.framework` in `package.json`: `next` by default, or
  `react-router`) and the root config overrides of that framework (`next.config.js`;
  `vite.config.ts`, `react-router.config.ts`);
- its generated `.runtime` directory.

The workspace root delegates its commands to the checked-out theme;
`STOREFRONT_THEME` selects one when several are checked out. Runtime brand
switching and compatibility aliases are intentionally unsupported.

## Required scripts

Every runnable theme exposes `runtime:init`, `dev`, `build`, `start`, `codegen`,
`widgets:build`, and `storybook`.

## Runtime integration

The runtime CLI is executed with the theme package as its working directory:

```bash
yarn runtime:init
```

This creates `themes/<name>/.runtime`, the app of the theme's framework; `@src`
and `@codegen` resolve against that same package. Theme code imports framework
APIs only through the `@shopana/storefront` facades (`link`, `navigation`,
`image`, `dynamic`, `headers`, `page-client`, `page-definition`), so it runs
under either framework; only the root files of `src/runtime` are framework
specific (see the runtime package README).

## Checkout integration

Themes implement `CheckoutThemeAdapter`, bind it in a theme-owned checkout page,
and pass that page loader to `registerCheckoutModule`. The checkout package does
not import theme source or theme aliases.

## Creating a theme

Copy the complete theme package contract, assign a new workspace package name,
provide its config and composition adapters, and check it out under
`themes/<name>`. Do not add a logo-only package or a runtime fallback
branch.
