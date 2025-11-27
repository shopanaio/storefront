import { useMediaQuery } from "react-responsive";
import { breakpoints } from "../ui-kit/Theme/breakpoints";
import { useUA } from "@src/ui-kit/UserAgent";
import { useServer } from "@src/hooks/useServer";

export const useIsMobile = () => {
  const ua = useUA();
  const isServer = useServer();
  const matches = useMediaQuery({
    maxWidth: breakpoints.lg - 0.05,
  });

  return isServer ? ua.isMobile : matches;
};
