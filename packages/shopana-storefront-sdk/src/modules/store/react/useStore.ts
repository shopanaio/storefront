'use client';

import { useContext } from 'react';
import { StoreContext, type Store } from './StoreContext';

/** The store of the storefront: name, contacts, brand and published policy links. */
export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within AppProvider');
  }
  return store;
}
