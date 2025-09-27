"use client";

import { SessionClientProvider } from "@src/providers/session-client-provider";
import CartProvider from "@src/providers/cart";
import { Theme } from "@src/components/Theme/Theme";
import { useQuery } from "@src/providers/relay-query-provider";
import cartIdUtils from "@src/utils/cartId";

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
      <CartProvider getId={cartIdUtils.getCartIdFromCookie}>
        <Theme>{children}</Theme>
      </CartProvider>
    </SessionClientProvider>
  );
};

export default App;
