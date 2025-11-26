const xs = 375;
const sm = 576;
const md = 768;
const lg = 1024;
const xl = 1280;
const xxl = 1440;

export const breakpoints = {
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
};

export const mq = {
  sm: `@media (min-width: ${sm}px)`,
  md: `@media (min-width: ${md}px)`,
  lg: `@media (min-width: ${lg}px)`,
  xl: `@media (min-width: ${xl}px)`,
  xxl: `@media (min-width: ${xxl}px)`,

  max: {
    sm: `@media (max-width: ${sm - 0.05}px)`,
    md: `@media (max-width: ${md - 0.05}px)`,
    lg: `@media (max-width: ${lg - 0.05}px)`,
    xl: `@media (max-width: ${xl - 0.05}px)`,
    xxl: `@media (max-width: ${xxl - 0.05}px)`,
  },

  only: {
    sm: `@media (min-width: ${sm}px) and (max-width: ${md - 0.05}px)`,
    md: `@media (min-width: ${md}px) and (max-width: ${lg - 0.05}px)`,
    lg: `@media (min-width: ${lg}px) and (max-width: ${xl - 0.05}px)`,
    xl: `@media (min-width: ${xl}px) and (max-width: ${xxl - 0.05}px)`,
  },
};
