/**
 * Brand Configuration
 *
 * This file imports brand configuration from the dynamically resolved brand package.
 * The actual brand is determined by the BRAND environment variable via webpack replacement.
 *
 * Available brands are not referenced here; webpack maps `@shopana/brand` to the active package.
 */

export { brandConfig } from '@shopana/brand';
export type { BrandConfig, LogoProps } from '@shopana/brand';
