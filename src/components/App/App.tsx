"use client";

import { SessionClientProvider } from "@src/providers/session-client-provider";
import { Theme } from "@src/components/Theme/Theme";
import { useQuery } from "@src/providers/relay-query-provider";
import ConfirmPortalHost from "@src/components/UI/Confirm/ConfirmPortalHost";

import useInitialSessionState from "@src/hooks/session/useInitialSessionState";

interface IAppProps {
  children: React.ReactNode;
}

const App = ({ children }: IAppProps) => {
  const preloadedSessionQuery = useQuery();
  const initialSessionState = useInitialSessionState({
    preloadedSessionQuery,
  });

  return (
    <SessionClientProvider initialState={initialSessionState}>
      <Theme>
        {children}
        <ConfirmPortalHost />
      </Theme>
    </SessionClientProvider>
  );
};

export default App;
