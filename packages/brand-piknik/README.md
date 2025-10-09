# @shopana/brand-piknik

Piknik (Box Builder) brand package for Shopana storefront.

## Features

- Custom Piknik logo component
- Green color scheme (#00b576)
- Brand-specific configuration

## Usage

Set the `BRAND` environment variable to `piknik` when building:

```bash
BRAND=piknik yarn build
BRAND=piknik yarn dev
```

## Package Contents

- `src/components/Logo.tsx` - Piknik logo component
- `src/config.ts` - Piknik brand configuration
- `src/index.ts` - Package exports

## Development

```bash
# Build the package
yarn build

# Watch mode
yarn dev
```
