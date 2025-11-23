import { SessionStoreContext } from "@src/providers/session-client-provider";
import { SessionStore } from "@src/store/sessionStore";
import { useContext } from "react";
import { useStore } from "zustand";

export const useSession = <T>(selector: (store: SessionStore) => T): T => {
  const sessionStoreContext = useContext(SessionStoreContext);
  if (!sessionStoreContext) {
    throw new Error(`useSession must be used within SessionStoreProvider`);
  }
  return useStore(sessionStoreContext, selector);
};
