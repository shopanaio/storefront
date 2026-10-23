# @shopana/brand-sdk

Theme contract shared by Shopana storefront themes: the brand configuration a theme declares and
the React context that exposes it to the theme's components.

The package is private to this workspace: themes checked out under `themes/<name>` depend on it
as a workspace package.

## Usage

```tsx
import { BrandProvider, useBrand, useColorScheme } from '@shopana/brand-sdk';
import type { BrandConfig } from '@shopana/brand-sdk';

const brandConfig: BrandConfig = {
  // `components.logo` and the theme's `generalSettings` (colors, typography, ...).
};

export function Root({ children }: { children: React.ReactNode }) {
  return <BrandProvider brandConfig={brandConfig}>{children}</BrandProvider>;
}
```

- `BrandProvider` provides the logo component and the general settings to its subtree.
- `useBrand()` reads them: `{ LogoComponent, generalSettings }`.
- `useColorScheme(schemeId?)` resolves a section's color scheme against the general settings,
  falling back to the default scheme.

The types `BrandConfig`, `ColorPalette`, `ColorScheme`, `ColorSettings`, `GeneralSettings`, and
`LogoProps` describe the contract; see [`src/types.ts`](src/types.ts).

## License

[Apache-2.0](./LICENSE)
