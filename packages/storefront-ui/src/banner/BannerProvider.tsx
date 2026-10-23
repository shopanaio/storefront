'use client';

import { theme as antdTheme } from 'antd';
import clsx from 'clsx';
import { createContext, useContext, useMemo } from 'react';
import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { toneColors, type BannerTone, type BannerToneColors } from './tones';

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
export type BannerIcon = ComponentType<{
  size?: number;
  'aria-hidden'?: boolean;
}>;

export interface BannerTheme {
  /** Classes added to the parts of every banner. */
  classNames?: Partial<Record<BannerPart, string>>;
  /** Inline styles of the parts of every banner. */
  styles?: Partial<Record<BannerPart, CSSProperties>>;
  /** Icons of the tones. */
  icons?: Partial<Record<BannerTone, BannerIcon>>;
  /** Colors of the tones, over the ones from the antd status tokens. */
  tones?: Partial<Record<BannerTone, Partial<BannerToneColors>>>;
}

export interface BannerProviderProps extends BannerTheme {
  children: ReactNode;
}

const BannerThemeContext = createContext<BannerTheme>({});

/**
 * What a theme changes in every banner under it without touching them: the classes and styles
 * of their parts, the icons and the colors of the tones. Inside another provider it adds to it:
 * classes of a part add up, styles, icons and colors override the outer ones one by one.
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
}: BannerProviderProps) {
  const parent = useContext(BannerThemeContext);
  const value = useMemo<BannerTheme>(
    () => ({
      classNames: mergeParts(parent.classNames, classNames, (outer, inner) =>
        clsx(outer, inner)
      ),
      styles: mergeParts(parent.styles, styles, (outer, inner) => ({
        ...outer,
        ...inner,
      })),
      icons: { ...parent.icons, ...icons },
      tones: mergeParts(parent.tones, tones, (outer, inner) => ({
        ...outer,
        ...inner,
      })),
    }),
    [parent, classNames, styles, icons, tones]
  );
  return (
    <BannerThemeContext.Provider value={value}>
      {children}
    </BannerThemeContext.Provider>
  );
}

/** Classes, styles, icons and tone colors of the `BannerProvider`s around the component. */
export const useBannerTheme = () => useContext(BannerThemeContext);

/**
 * Colors of a tone as the banners under the nearest `BannerProvider` draw them, for a control
 * placed in a banner (its `extra`) or anything that speaks in the tone of the banners.
 */
export function useBannerTone(tone: BannerTone): BannerToneColors {
  const { token } = antdTheme.useToken();
  const overrides = useBannerTheme().tones?.[tone];
  return useMemo(
    () => ({ ...toneColors(token, tone), ...overrides }),
    [token, tone, overrides]
  );
}

function mergeParts<K extends string, V>(
  outer: Partial<Record<K, V>> | undefined,
  inner: Partial<Record<K, V>> | undefined,
  merge: (outer: V, inner: V) => V
): Partial<Record<K, V>> {
  const result: Partial<Record<K, V>> = { ...outer };
  for (const key of Object.keys(inner ?? {}) as K[]) {
    const own = inner![key];
    if (own === undefined) continue;
    const before = result[key];
    result[key] = before === undefined ? own : merge(before, own);
  }
  return result;
}
