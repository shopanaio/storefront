# Local Development Guide

## Overview

This package is set up for local development with hot reload support using TypeScript path mapping.

## How It Works

The main application imports this package directly from source files using TypeScript path aliases, avoiding the need for npm link or constant rebuilding:

- **TypeScript Paths**: The root `tsconfig.json` maps `@shopana/next-ecommerce-core/*` to `./packages/next-ecommerce-core/src/*`
- **Next.js Transpilation**: `next.config.js` includes this package in `transpilePackages` for on-the-fly compilation
- **Hot Reload**: Changes in source files automatically trigger Next.js hot reload

## Development Workflow

### Option 1: Direct Source Development (Recommended)

This is the fastest approach - Next.js will automatically transpile and hot reload your changes:

```bash
# In the root directory, start the Next.js dev server
yarn dev
```

Now you can edit files in `packages/next-ecommerce-core/src/` and changes will be immediately reflected in your browser.

### Option 2: With TypeScript Watch Mode

If you want TypeScript type checking and declaration files to be generated on save:

```bash
# Terminal 1: Start TypeScript compiler in watch mode
cd packages/next-ecommerce-core
yarn dev

# Terminal 2: Start Next.js dev server
cd ../..
yarn dev
```

### Option 3: Using Yarn Workspaces

```bash
# From root directory, run both in parallel
yarn workspace @shopana/next-ecommerce-core dev & yarn dev
```

## TypeScript Paths Configuration

The following paths are configured in the root `tsconfig.json`:

```json
{
  "@shopana/next-ecommerce-core": ["./packages/next-ecommerce-core/src/index.ts"],
  "@shopana/next-ecommerce-core/*": ["./packages/next-ecommerce-core/src/*"],
  "@shopana/next-ecommerce-core/core": ["./packages/next-ecommerce-core/src/core/index.ts"],
  "@shopana/next-ecommerce-core/shop": ["./packages/next-ecommerce-core/src/shop/index.ts"],
  "@shopana/next-ecommerce-core/sdk": ["./packages/next-ecommerce-core/src/sdk/index.ts"],
  "@shopana/next-ecommerce-core/app/[[...slug]]/page": ["./packages/next-ecommerce-core/src/app/[[...slug]]/page.tsx"]
}
```

## Import Examples

```tsx
// Main entry point
import { PageBuilder, registerDefaultTemplates } from '@shopana/next-ecommerce-core';

// Core utilities
import { usePageData, PageDataProvider } from '@shopana/next-ecommerce-core/core';

// Shop context
import { ShopProvider, useShop } from '@shopana/next-ecommerce-core/shop';

// SDK hooks
import { useProduct, useCollection } from '@shopana/next-ecommerce-core/sdk';

// Direct page export
export { default } from '@shopana/next-ecommerce-core/app/[[...slug]]/page';
```

## Building for Production

Before publishing or deploying:

```bash
cd packages/next-ecommerce-core
yarn build
```

This generates:
- Compiled JavaScript in `dist/`
- TypeScript declaration files (`*.d.ts`)
- Source maps

## Troubleshooting

### Changes not reflecting

1. Check that `transpilePackages` includes `@shopana/next-ecommerce-core` in `next.config.js`
2. Restart the Next.js dev server
3. Clear Next.js cache: `rm -rf .next`

### TypeScript errors

1. Rebuild the package: `yarn build`
2. Restart TypeScript server in your IDE
3. Check `tsconfig.json` paths are correct

### Import errors

Make sure you're using the correct import paths as shown in the examples above. The package exports are defined in `package.json` under the `exports` field.

## Package Structure

```
packages/next-ecommerce-core/
├── src/                    # Source files (imported directly during dev)
│   ├── app/               # Next.js app router pages
│   ├── core/              # Core framework utilities
│   ├── shop/              # Shop context and configuration
│   ├── sdk/               # Data fetching and hooks
│   ├── sections/          # Built-in sections
│   ├── templates/         # Default templates
│   └── index.ts           # Main entry point
├── dist/                  # Compiled output (for production)
├── package.json
├── tsconfig.json
└── DEVELOPMENT.md         # This file
```

## Next Steps

- Edit components in `src/sections/`
- Modify templates in `src/templates/`
- Update core types in `src/core/types.ts`
- Enhance SDK hooks in `src/sdk/client/hooks.ts`

All changes will hot reload automatically!
