import { useMediaQuery } from "react-responsive";
import { breakpoints } from "../components/Theme/breakpoints";
import { useUA } from "@src/hooks/useUA";
import { useServer } from "@src/hooks/useServer";

export const useIsMobile = () => {
  const ua = useUA();
  const isServer = useServer();
  const matches = useMediaQuery({
    maxWidth: breakpoints.lg - 0.05,
  });

  return isServer ? ua.isMobile : matches;
};
