import { useMediaQuery } from "react-responsive";
import { breakpoints } from "../components/Theme/breakpoints";
import { useUA } from "@src/hooks/useUA";
import { useServer } from "@src/hooks/useServer";

export const useIsDesktop = () => {
  const isServer = useServer();
  const matches = useMediaQuery({ minWidth: breakpoints.xl });
  const ua = useUA();

  if (isServer && ua) {
    return ua.isDesktop;
  }

  return matches;
};
