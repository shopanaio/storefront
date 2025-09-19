import { useMediaQuery } from "react-responsive";
import { breakpoints } from "../components/Theme/breakpoints";
import { useResponsiveContext } from "@src/providers/responsive-provider";

export const useBreakpoints = () => {
  const context = useResponsiveContext();

  const isClient = typeof window !== "undefined";

  // On client use pure `matchMedia` result. On server — value from context.
  const isLg = useMediaQuery({ minWidth: breakpoints.lg });

  const finalIsLg = isClient
    ? isLg
    : context?.isDesktop
      ? true
      : context?.isMobile
        ? false
        : isLg;

  const isXs = useMediaQuery({ minWidth: breakpoints.xs });
  const isSm = useMediaQuery({ minWidth: breakpoints.sm });
  const isMd = useMediaQuery({ minWidth: breakpoints.md });
  const isXl = useMediaQuery({ minWidth: breakpoints.xl });
  const isXxl = useMediaQuery({ minWidth: breakpoints.xxl });

  return {
    isXs,
    isSm,
    isMd,
    isLg: finalIsLg,
    isXl,
    isXxl,
    isMobile: !finalIsLg,
    isTablet: isMd && !finalIsLg,
    isDesktop: isXl,
  };
};
