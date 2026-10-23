'use client';

import { createContext, useContext, useMemo } from 'react';
import type { ComponentType, CSSProperties, ReactNode } from 'react';
import type { BannerTone, BannerToneColors } from './tones';

/** Parts of a banner a theme can restyle. */
export type BannerPart =
  | 'root'
  | 'icon'
  | 'title'
  | 'description'
  | 'content'
  | 'side'
  | 'action'
  | 'close';

/** Icon of a tone, drawn in the accent color of the tone. */
export type BannerIcon = ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;

export interface BannerTheme {
  /** Classes added to the parts of every banner. */
  classNames?: Partial<Record<BannerPart, string>>;
  /** Inline styles of the parts of every banner. */
  styles?: Partial<Record<BannerPart, CSSProperties>>;
  /** Icons of the tones. */
  icons?: Partial<Record<BannerTone, BannerIcon>>;
  /**
   * Colors of the tones. A `--banner-<tone>-<part>` custom property set in CSS wins over them;
   * the defaults are `BANNER_TONES`.
   */
  tones?: Partial<Record<BannerTone, Partial<BannerToneColors>>>;
}

const BannerThemeContext = createContext<BannerTheme>({});

/**
 * What a theme changes in the banners of the storefront (the checkout and the sign-in) without
 * touching them: the classes and styles of their parts, the icons and the colors of the tones.
 *
 * @example
 * ```tsx
 * <BannerProvider classNames={{ root: 'brand-banner' }} tones={{ action: { accent: '#1c49c2' } }}>
 *   {children}
 * </BannerProvider>
 * ```
 */
export function BannerProvider({
  children,
  classNames,
  styles,
  icons,
  tones,
}: BannerTheme & { children: ReactNode }) {
  const value = useMemo(
    () => ({ classNames, styles, icons, tones }),
    [classNames, styles, icons, tones]
  );
  return <BannerThemeContext.Provider value={value}>{children}</BannerThemeContext.Provider>;
}

export const useBannerTheme = () => useContext(BannerThemeContext);
