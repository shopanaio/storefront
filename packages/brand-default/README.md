# @shopana/brand-default

Default Shopana brand package for the storefront.

## Features

- Default Shopana logo component
- Default Ant Design color scheme
- Standard brand configuration

## Usage

This is the default brand package. It will be used automatically if no `BRAND` environment variable is set:

```bash
yarn build
yarn dev
```

Or explicitly set it:

```bash
BRAND=default yarn build
BRAND=default yarn dev
```

## Package Contents

- `src/components/Logo.tsx` - Shopana logo component
- `src/config.ts` - Default brand configuration
- `src/index.ts` - Package exports

## Development

```bash
# Build the package
yarn build

# Watch mode
yarn dev
```
