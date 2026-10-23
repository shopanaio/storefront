/**
 * Widths of the storefront layout. Unlike antd's breakpoints (lg = 992px) they follow the
 * checkout's and the theme's own CSS. Every query of the package is built from them here.
 */
export const breakpoints = {
  xs: 375,
  sm: 576,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1440,
} as const;

export type Breakpoint = keyof typeof breakpoints;

const below = (breakpoint: Breakpoint) =>
  `(max-width: ${breakpoints[breakpoint] - 0.05}px)`;
const from = (breakpoint: Breakpoint) =>
  `(min-width: ${breakpoints[breakpoint]}px)`;

/**
 * Media queries without `@media`, for `useMediaQuery` and `window.matchMedia`:
 * `below(bp)` / `from(bp)` of any breakpoint, and the named ones of the components.
 */
export const queries = {
  below,
  from,
  /** A phone: `ResponsiveDialog` and `CountryPicker` turn into bottom sheets. */
  phone: below('md'),
  /** `DrawerBase` turns from a side panel into a bottom sheet. */
  drawerSheet: below('lg'),
};

/** The same queries as CSS at-rules, for `createStyles`. */
export const mq = {
  sm: `@media ${from('sm')}`,
  md: `@media ${from('md')}`,
  lg: `@media ${from('lg')}`,
  xl: `@media ${from('xl')}`,
  xxl: `@media ${from('xxl')}`,
  max: {
    sm: `@media ${below('sm')}`,
    md: `@media ${below('md')}`,
    lg: `@media ${below('lg')}`,
    xl: `@media ${below('xl')}`,
    xxl: `@media ${below('xxl')}`,
  },
};
