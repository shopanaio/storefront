import { create } from 'zustand';
import { CartStore, createCartStore } from '../../store';

/**
 * Create cart store using Zustand
 * This is the default React implementation
 */
export function createCartStoreZustand(): CartStore {
  const useZustandStore = create<CartStore>(() => ({
    cart: null,
    loading: false,
    loaded: false,
    error: null,
    version: 0,
    setCart: () => {},
    optimisticAdd: () => ({ version: 0, revert: () => {} }),
    optimisticRemove: () => ({ version: 0, revert: () => {} }),
    optimisticUpdate: () => ({ version: 0, revert: () => {} }),
    optimisticReplace: () => ({ version: 0, revert: () => {} }),
    optimisticClear: () => ({ version: 0, revert: () => {} }),
  }));

  return createCartStore({
    getState: () => useZustandStore.getState(),
    setState: (updater) => {
      if (typeof updater === 'function') {
        useZustandStore.setState(updater);
      } else {
        useZustandStore.setState(updater);
      }
    },
    subscribe: (listener) => useZustandStore.subscribe(listener),
  });
}
