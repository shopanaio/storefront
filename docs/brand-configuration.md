# Brand Configuration System

This document describes the brand configuration system that allows dynamic brand switching at build time.

## Overview

The storefront supports multiple brand configurations through a package-based approach. Each brand has its own package with custom logo, colors, and theme settings.

## Available Brands

- **default** - Shopana default branding (default)
- **piknik** - Piknik (Box Builder) branding with green color scheme

## Switching Brands

Set the `BRAND` environment variable when building or running the application:

```bash
# Build with Piknik branding
BRAND=piknik yarn build

# Run development server with Piknik branding
BRAND=piknik yarn dev

# Build with default branding (or omit BRAND variable)
BRAND=default yarn build
yarn build
```

## How It Works

### 1. Brand Packages

Each brand has its own package in `packages/brand-{name}/`:

```
packages/
├── brand-default/
│   ├── src/
│   │   ├── components/
│   │   │   └── Logo.tsx
│   │   ├── config.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── brand-piknik/
    ├── src/
    │   ├── components/
    │   │   └── Logo.tsx
    │   ├── config.ts
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

### 2. Dynamic Aliasing

The webpack configuration in `next.config.js` dynamically resolves the `@shopana/brand` alias based on the `BRAND` environment variable:

```javascript
const brand = process.env.BRAND || 'default';
config.resolve.alias = {
  ...config.resolve.alias,
  '@shopana/brand': path.resolve(`packages/brand-${brand}/src`),
};
```

### 3. Main Configuration

The main brand configuration file (`src/brand.config.ts`) re-exports from the dynamically resolved brand package:

```typescript
export { brandConfig } from '@shopana/brand';
export type { BrandConfig, LogoProps } from '@shopana/brand';
```

### 4. Usage in Components

Components use the brand configuration through hooks:

```tsx
import { useLogo } from '@src/hooks/useLogo';

const MyComponent = () => {
  const Logo = useLogo();
  return <Logo size={40} theme="light" />;
};
```

### 5. Theme Integration

The brand configuration is integrated into the theme system (`src/components/Theme/Theme.tsx`):

```tsx
import { brandConfig } from '@src/brand.config';

// Theme configuration
token: {
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif;',
  ...(brandConfig.theme.colorPrimary && {
    colorPrimary: brandConfig.theme.colorPrimary,
  }),
}
```

## Creating a New Brand

1. **Create a new brand package:**

```bash
mkdir -p packages/brand-mybrand/src/components
```

2. **Add package.json:**

```json
{
  "name": "@shopana/brand-mybrand",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

3. **Create your logo component:**

```tsx
// packages/brand-mybrand/src/components/Logo.tsx
export interface MyBrandLogoProps {
  noText?: boolean;
  theme?: 'dark' | 'light';
  size: number;
  color?: string;
}

export const MyBrandLogo = ({ size, color = '#000' }: MyBrandLogoProps) => {
  // Your SVG logo here
  return <svg>...</svg>;
};
```

4. **Create brand configuration:**

```tsx
// packages/brand-mybrand/src/config.ts
import { ComponentType } from 'react';
import { MyBrandLogo } from './components/Logo';

export interface LogoProps {
  noText?: boolean;
  theme?: 'dark' | 'light';
  size: number;
  color?: string;
}

export interface BrandConfig {
  components: {
    logo: ComponentType<LogoProps>;
  };
  theme: {
    colorPrimary?: string;
  };
}

export const brandConfig: BrandConfig = {
  components: {
    logo: MyBrandLogo,
  },
  theme: {
    colorPrimary: '#ff0000', // Your brand color
  },
};
```

5. **Export everything:**

```tsx
// packages/brand-mybrand/src/index.ts
export { MyBrandLogo } from './components/Logo';
export type { MyBrandLogoProps } from './components/Logo';
export { brandConfig } from './config';
export type { BrandConfig, LogoProps } from './config';
```

6. **Build with your brand:**

```bash
BRAND=mybrand yarn build
```

## Technical Details

- **Build-time resolution**: Brand selection happens at build time through webpack aliases
- **Type safety**: All brand packages share the same `BrandConfig` interface for type consistency
- **Zero runtime overhead**: No runtime brand switching logic, everything is resolved at build time
- **TypeScript support**: Full TypeScript support with proper type inference

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BRAND` | Brand package to use | `default` |

## Troubleshooting

### TypeScript errors after switching brands

Run TypeScript in watch mode or restart your IDE:

```bash
yarn tsc --watch
```

### Brand not switching in development

Restart the development server after changing the `BRAND` environment variable:

```bash
BRAND=piknik yarn dev
```

### Logo not displaying

Check that:
1. The brand package exists in `packages/brand-{name}/`
2. The logo component is properly exported from `src/index.ts`
3. The component implements the correct props interface
