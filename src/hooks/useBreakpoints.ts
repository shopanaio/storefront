import { useMediaQuery } from "react-responsive";
import { breakpoints } from "../ui-kit/Theme/breakpoints";
import { useUA } from "@src/ui-kit/UserAgent/useUA";
import { useServer } from "@src/hooks/useServer";

// TODO: Write correct hook
export const useBreakpoints = () => {
  const ua = useUA();

  const isServer = useServer();

  // On client use pure `matchMedia` result. On server — value from context.
  const isLg = useMediaQuery({ minWidth: breakpoints.lg });

  const finalIsLg = !isServer
    ? isLg
    : ua?.isDesktop
    ? true
    : ua?.isMobile
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
