'use client';

import { createContext, type ReactNode } from 'react';
import type { SdkStoreFragment } from '../../../graphql/apollo/generated/operations';

export type Store = SdkStoreFragment;

export const StoreContext = createContext<Store | null>(null);

export function StoreProvider({
  store,
  children,
}: {
  store: Store;
  children: ReactNode;
}) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
