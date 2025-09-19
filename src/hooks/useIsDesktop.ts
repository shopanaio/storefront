import { useMediaQuery } from "react-responsive";
import { breakpoints } from "../components/Theme/breakpoints";
import { useResponsiveContext } from "@src/providers/responsive-provider";

export const useIsDesktop = () => {
  const matches = useMediaQuery({ minWidth: breakpoints.xl });
  const context = useResponsiveContext();

  if (typeof window === "undefined" && context) {
    return context.isDesktop;
  }

  return matches;
};
