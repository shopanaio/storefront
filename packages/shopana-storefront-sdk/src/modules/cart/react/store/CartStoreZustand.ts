import { create, UseBoundStore, StoreApi } from 'zustand';
import { CartStore, createCartStore } from '../../store';
import type { model } from '../../../model';

/**
 * Return type for createCartStoreZustand
 * Includes both the store object (for methods) and zustand hook (for selectors)
 */
export interface CartStoreZustand {
  /**
   * Store object with methods (setCart, checkoutLinesAdd, etc.)
   * Use this for calling actions
   */
  store: CartStore;

  /**
   * Zustand hook for accessing state with selectors
   * Use this in React components: useStore(s => s.cart)
   */
  useStore: UseBoundStore<StoreApi<CartStore>>;
}

/**
 * Create cart store using Zustand
 * This is the default React implementation
 *
 * Added optional initialCart to support SSR hydration:
 * store can be created with server-loaded cart data.
 *
 * @param initialCart - Optional initial cart state (for SSR hydration)
 * @returns Object with store (for actions) and useStore (for selectors)
 */
export function createCartStoreZustand(
  initialCart?: model.Cart | null
): CartStoreZustand {
  const useZustandStore = create<CartStore>(() => ({
    cart: initialCart ?? null,
    loading: false,
    loaded: !!initialCart,
    error: null,
    setCart: () => {},
    checkoutLinesAdd: () => ({ revert: () => {} }),
    checkoutLinesDelete: () => ({ revert: () => {} }),
    checkoutLinesUpdate: () => ({ revert: () => {} }),
    checkoutLinesReplace: () => ({ revert: () => {} }),
    checkoutClear: () => ({ revert: () => {} }),
  }));

  const store = createCartStore({
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

  return {
    store,
    useStore: useZustandStore,
  };
}
