# Themes

A theme is a complete runnable storefront application built on the workspace packages. Themes
are not part of this repository: each one lives in its own repository and is checked out here
on demand.

```bash
git clone <theme-repository-url> themes/<theme-name>
yarn install
```

Every directory under `themes/` is a Yarn workspace and is ignored by Git. The root commands
(`yarn dev`, `yarn build`, `yarn start`, `yarn runtime:init`, `yarn storybook:theme`, …) run the
only checked-out theme; with several themes, select one with `STOREFRONT_THEME`:

```bash
STOREFRONT_THEME=<theme-name> yarn dev
```

Without a theme, the packages are still linted, type-checked, tested, and built on their own.
