import type { model } from '../../../../model/namespace';
import { useCartStore } from '../context/CartContext';
import { useShallow } from 'zustand/shallow';

type UseCart = () => {
  cart: model.Cart | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
};

const useCart: UseCart = () => {
  const useStore = useCartStore();

  return useStore(
    useShallow((s) => ({
      cart: s.cart,
      loading: s.loading,
      loaded: s.loaded,
      error: s.error,
    }))
  );
};

export default useCart;
