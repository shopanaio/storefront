"use client";

import { SessionClientProvider } from "@src/providers/session-client-provider";
import { Theme } from "@src/components/Theme/Theme";
import { useQuery } from "@src/providers/relay-query-provider";
import ConfirmPortalHost from "@src/components/UI/Confirm/ConfirmPortalHost";

import { useInitialSessionState } from "@shopana/storefront-sdk/modules/session/react/hooks";
import { WishlistProvider } from "@src/modules/wishlist";

interface IAppProps {
  children: React.ReactNode;
}

const App = ({ children }: IAppProps) => {
  const preloadedSessionQuery = useQuery();
  const { session } = useInitialSessionState({
    preloadedSessionQuery,
  });

  return (
    <SessionClientProvider initialState={{ session }}>
      <WishlistProvider>
        <Theme>
          {children}
          <ConfirmPortalHost />
        </Theme>
      </WishlistProvider>
    </SessionClientProvider>
  );
};

export default App;
