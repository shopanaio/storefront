import { useMediaQuery } from "react-responsive";
import { breakpoints } from "../components/Theme/breakpoints";
import { useResponsiveContext } from "@src/providers/responsive-provider";

export const useIsMobile = () => {
  // Value obtained via `matchMedia`. Will be correct only in browser.
  const matches = useMediaQuery({ maxWidth: breakpoints.lg - 0.05 });
  const context = useResponsiveContext();

  // On client side give priority to real `matchMedia`.
  if (typeof window !== "undefined") {
    return matches;
  }

  // On server `window` is unavailable, so rely on value from context.
  return context ? context.isMobile : matches;
};
