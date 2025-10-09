/**
 * Brand Configuration
 *
 * This module selects brand configuration at build/runtime without relying on webpack aliases.
 * It chooses between installed workspace packages based on NEXT_PUBLIC_BRAND env variable.
 *
 * Available brands:
 * - default: Shopana default branding
 * - piknik: Piknik (Box Builder) branding
 *
 * Usage:
 * - Set NEXT_PUBLIC_BRAND=default | piknik (or leave empty to use default)
 * - Example: `NEXT_PUBLIC_BRAND=piknik yarn dev`
 *
 * Notes:
 * - Both brand packages should be present in the monorepo workspaces.
 * - Types are re-exported from the default brand for consistency.
 */

import { brandConfig as defaultBrandConfig } from '@shopana/brand-default';
import { brandConfig as piknikBrandConfig } from '@shopana/brand-piknik';

// Re-export types from the default brand package to provide a single canonical type surface
export type { BrandConfig, LogoProps } from '@shopana/brand-default';

/**
 * Selected brand configuration based on NEXT_PUBLIC_BRAND
 */
export const brandConfig =
  (process.env.NEXT_PUBLIC_BRAND ?? 'default') === 'piknik'
    ? piknikBrandConfig
    : defaultBrandConfig;
