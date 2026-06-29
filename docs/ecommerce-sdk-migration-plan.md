# API Layer Migration Plan for `@shopana/storefront-sdk`

**Created:** 2025-11-23  
**Status:** In progress  
**Goal:** move the entire API layer from the storefront into a reusable SDK package.

## Overview

Create a new monorepo package named `@shopana/storefront-sdk`. The package should contain:
- GraphQL hooks based on Relay
- Relay infrastructure: environment and SSR helpers
- Zustand stores: cart, session, app
- React providers
- GraphQL queries
- Multi-provider support for Shopana and Shopify

## Project Structure

### Current Structure: Code to Move

```text
storefront/src/
├── hooks/              # About 158 hook files
│   ├── auth/           # useSignIn, useSignUp, useSignOut
│   ├── cart/           # useAddItemToCart, useCart, useUpdateCartLineQuantity
│   ├── category/       # useCategoryClientQuery
│   ├── product/        # useProduct, useProductBundlePricing
│   ├── search/         # usePredictiveSearch
│   ├── session/        # useGetSession, useGetSessionData
│   └── [utils]         # useBreakpoints, useCurrency, useIsMobile
├── relay/              # 4 Relay infrastructure files
│   ├── Environment.ts
│   ├── loadSerializableQuery.ts
│   ├── useSerializablePreloadedQuery.ts
│   └── SessionPreloadProvider.tsx
├── store/              # 4 Zustand stores
│   ├── cartStore.ts    # Optimistic updates
│   ├── sessionStore.ts
│   ├── appStore.ts
│   └── cartMath.ts
├── queries/            # Shared GraphQL queries
│   ├── CategoryQuery/
│   ├── Listing/
│   └── Reviews/
├── providers/          # React contexts
│   ├── cart-context.tsx
│   └── session-context.tsx
└── cms/
    └── pick.ts         # Multi-provider picker
```

### Target SDK Structure

```text
packages/ecommerce-sdk/
├── src/
│   ├── hooks/          # All hooks from storefront
│   ├── relay/          # Relay infrastructure
│   ├── store/          # Zustand stores
│   ├── queries/        # GraphQL queries
│   ├── providers/      # React providers
│   ├── utils/          # cmsPick, accessToken
│   └── index.ts        # Main export
├── schema.shopana.graphql
├── schema.shopify.graphql
├── relay.shopana.json
├── relay.shopify.json
├── package.json
├── tsconfig.json
└── README.md
```

## Stage 1: Create the Package Structure

### 1.1 Create Directories and Base Files

```bash
mkdir -p packages/ecommerce-sdk/src/{hooks,relay,store,queries,providers,utils}
```

### 1.2 Create `package.json`

```json
{
  "name": "@shopana/storefront-sdk",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./hooks": {
      "types": "./dist/hooks/index.d.ts",
      "default": "./dist/hooks/index.js"
    },
    "./hooks/auth": {
      "types": "./dist/hooks/auth/index.d.ts",
      "default": "./dist/hooks/auth/index.js"
    },
    "./hooks/cart": {
      "types": "./dist/hooks/cart/index.d.ts",
      "default": "./dist/hooks/cart/index.js"
    },
    "./hooks/product": {
      "types": "./dist/hooks/product/index.d.ts",
      "default": "./dist/hooks/product/index.js"
    },
    "./relay": {
      "types": "./dist/relay/index.d.ts",
      "default": "./dist/relay/index.js"
    },
    "./store": {
      "types": "./dist/store/index.d.ts",
      "default": "./dist/store/index.js"
    },
    "./providers": {
      "types": "./dist/providers/index.d.ts",
      "default": "./dist/providers/index.js"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "relay:shopana": "relay-compiler --config relay.shopana.json",
    "relay:shopify": "relay-compiler --config relay.shopify.json",
    "relay": "yarn relay:shopana && yarn relay:shopify"
  },
  "dependencies": {
    "@shopana/entity": "*",
    "zustand": "^5.0.6",
    "js-cookie": "^3.0.5",
    "lodash": "^4.17.21"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "react-relay": "^20.0.0",
    "relay-runtime": "^20.0.0",
    "next": "^14.0.0 || ^15.0.0 || ^16.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "relay-compiler": "^20.0.0",
    "typescript": "^5.7.2"
  }
}
```

### 1.3 Create `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2021", "DOM"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@shopana/entity": ["../entity/dist/index.d.ts"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/__generated__/**"]
}
```

## Stage 2: Move Code

### 2.1 Hooks: About 158 Files

```bash
cp -r storefront/src/hooks/* packages/ecommerce-sdk/src/hooks/
```

Hook categories:
- `auth/` - `useSignIn`, `useSignUp`, `useSignOut`, `useForgotPassword`, `useResetPassword`
- `cart/` - `useAddItemToCart`, `useCart`, `useUpdateCartLineQuantity`, `useRemoveItemFromCart`
- `category/` - `useCategoryClientQuery`, `loadCategoryServerQuery`, `useFilters`
- `product/` - `useProduct`, `usePreloadedProduct`, `useProductBundlePricing`
- `search/` - `usePredictiveSearch`, `useSearchRefetch`
- `session/` - `useGetSession`, `useGetSessionData`, `useInitialSessionState`
- Utility hooks - `useBreakpoints`, `useCurrency`, `useMoney`, `useIsClient`

Multi-provider pattern:

```text
hooks/cart/useAddItemToCart/
├── index.ts                    # CMS picker
├── useAddItemToCart.shopana.ts
├── useAddItemToCart.shopify.ts
└── interface.ts
```

### 2.2 Relay Infrastructure

Files:
- `relay/Environment.ts` - Relay environment with query response cache
- `relay/loadSerializableQuery.ts` - SSR loading
- `relay/useSerializablePreloadedQuery.ts` - client preload
- `relay/SessionPreloadProvider.tsx` - session preload provider

Command:

```bash
cp -r storefront/src/relay/* packages/ecommerce-sdk/src/relay/
```

### 2.3 Zustand Stores

Files:
- `store/cartStore.ts` - optimistic updates, versioning, cart operations
- `store/sessionStore.ts` - user session state
- `store/appStore.ts` - currency and locale only
- `store/cartMath.ts` - calculation utilities

Command:

```bash
cp -r storefront/src/store/* packages/ecommerce-sdk/src/store/
```

Important refactor for `appStore.ts`:
- Keep `currency` and `locale`
- Remove UI state such as `isMobileMenuOpen`, `isSearchOpen`, `isSidebarOpen`, and similar flags

### 2.4 Queries

Command:

```bash
cp -r storefront/src/queries/* packages/ecommerce-sdk/src/queries/
```

### 2.5 Providers

Files:
- `providers/cart-context.tsx`
- `providers/session-context.tsx`

Command:

```bash
cp -r storefront/src/providers/* packages/ecommerce-sdk/src/providers/
```

### 2.6 Utilities

Move shared utilities such as CMS provider selection and access-token helpers.

Command:

```bash
cp -r storefront/src/cms packages/ecommerce-sdk/src/cms
cp -r storefront/src/utils/accessToken packages/ecommerce-sdk/src/utils/accessToken
```

## Stage 3: Fix Imports

### 3.1 Replace Path Aliases

Before:

```typescript
import { useCartStore } from '@src/store/cartStore';
import type { Cart } from '@src/types';
```

After:

```typescript
import { useCartStore } from '../store/cartStore';
import type { Cart } from '../types';
```

Replacement rules:
- `@src/store/*` -> relative `../store/*` or `../../store/*`
- `@src/hooks/*` -> relative paths inside SDK
- `@src/relay/*` -> relative `../relay/*`
- `@src/queries/*` -> relative `../queries/*`
- `@codegen/*` -> `../__generated__/*` after Relay setup

### 3.2 Remove Dependency on `next-intl`

Problem:
- Hooks use `useLocale()` from `next-intl`
- SDK should not depend on a specific i18n library

Solution 1: use `appStore`

```typescript
const locale = useAppStore((s) => s.locale);
```

Solution 2: pass locale as a function parameter

```typescript
function useProduct(handle: string, locale: string) {
  // ...
}
```

### 3.3 Environment Variables to Configuration

Problem:
- Code uses `process.env.NEXT_PUBLIC_*`
- SDK should work in different applications

Solution: create SDK configuration.

**File:** `src/config.ts`

```typescript
export interface SDKConfig {
  graphqlUrl: string;
  apiKey?: string;
  provider: 'shopana' | 'shopify';
  defaultLocale?: string;
  defaultCurrency?: string;
}

let config: SDKConfig | null = null;

export function initSDK(nextConfig: SDKConfig) {
  config = nextConfig;
}

export function getSDKConfig(): SDKConfig {
  if (!config) {
    throw new Error('SDK is not initialized. Call initSDK(config) first.');
  }
  return config;
}
```

Update `cmsPick` to read the configured provider.

## Stage 4: GraphQL Code Generation

### 4.1 Copy Schemas

```bash
cp storefront/schema.shopana.graphql packages/ecommerce-sdk/
cp storefront/schema.shopify.graphql packages/ecommerce-sdk/
```

### 4.2 Configure Relay Compiler

**File:** `relay.shopana.json`

```json
{
  "src": "./src",
  "schema": "./schema.shopana.graphql",
  "language": "typescript",
  "artifactDirectory": "./src/__generated__"
}
```

**File:** `relay.shopify.json`

```json
{
  "src": "./src",
  "schema": "./schema.shopify.graphql",
  "language": "typescript",
  "artifactDirectory": "./src/__generated__"
}
```

### 4.3 Run Generation

```bash
yarn relay
```

## Stage 5: Create Exports

### 5.1 Main Export

**File:** `src/index.ts`

```typescript
export * from './config';
export * from './hooks';
export * from './relay';
export * from './store';
export * from './providers';
export * from './queries';
```

### 5.2 Hook Exports

**File:** `src/hooks/index.ts`

```typescript
export * from './auth';
export * from './cart';
export * from './category';
export * from './product';
export * from './search';
export * from './session';
```

Create category-specific indexes for each hook group.

### 5.3 Other Module Exports

Create indexes for:
- `src/relay/index.ts`
- `src/store/index.ts`
- `src/providers/index.ts`

## Stage 6: Build and Validation

### 6.1 Run Build

```bash
yarn build
```

### 6.2 Check Output

Expected output:
- `dist/`
- `dist/index.js` and `dist/index.d.ts`
- `dist/hooks/`, `dist/relay/`, `dist/store/`, and related folders
- `.d.ts` files for TypeScript types

### 6.3 Check TypeScript Errors

The SDK build must pass before the application starts using it.

## Stage 7: Monorepo Integration

### 7.1 Install Dependencies

```bash
yarn install
```

This creates a symlink for the new package.

### 7.2 Add the SDK to the Storefront

**File:** `storefront/package.json`

```json
{
  "dependencies": {
    "@shopana/storefront-sdk": "*"
  }
}
```

## Stage 8: Documentation

### 8.1 Create `README.md`

**File:** `packages/ecommerce-sdk/README.md`

It should include:
- Package description
- Installation
- SDK initialization
- Hook usage examples
- Relay configuration
- Provider setup

## Problem Areas and Solutions

### 1. Dependency on `next-intl`

- **Problem:** hooks use `useLocale()` from `next-intl`
- **Solution:** use `appStore.locale` or pass locale as a parameter

### 2. Environment Variables

- **Problem:** code uses `process.env.NEXT_PUBLIC_*`
- **Solution:** use `initSDK(config)`

### 3. Optimistic Updates in `cartStore`

- **Problem:** tight integration with Relay mutations
- **Solution:** keep it as part of the API logic

### 4. Relay `__generated__` Files

- **Problem:** files are generated in storefront, but the SDK needs them
- **Solution:** configure Relay Compiler for the SDK separately

### 5. UI State in `appStore`

- **Problem:** `isMobileMenuOpen` and similar state do not belong to the API layer
- **Solution:** remove UI state from the SDK version and keep only `currency` and `locale`

## Execution Checklist

- [ ] Package structure created
- [ ] `package.json` and `tsconfig.json` configured
- [ ] Hooks moved, about 158 files
- [ ] Relay infrastructure moved
- [ ] Zustand stores moved
- [ ] Providers and queries moved
- [ ] Utilities moved
- [ ] Imports fixed
- [ ] GraphQL schemas and Relay Compiler configured
- [ ] Export index files created
- [ ] TypeScript build succeeds
- [ ] Package integrated into the monorepo
- [ ] Documentation created

## Next Steps Outside This Plan

After the SDK package is created:

1. Migrate storefront to use `@shopana/storefront-sdk`
2. Update imports in storefront
3. Remove old code from storefront
4. Test integration
5. Update other projects to use the SDK

## Contacts and Help

If problems occur:
- Check TypeScript errors with `yarn build`
- Check Relay generation with `yarn relay`
- Check dependencies with `yarn install`

**Plan author:** Claude Code  
**Last updated:** 2025-11-23
