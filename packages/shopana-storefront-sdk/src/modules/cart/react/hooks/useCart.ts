import type { model } from '../../../../model';
import { useCartStore } from '../context';

type UseCart = () => {
  cart: model.Cart | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
};

const useCart: UseCart = () => {
  const store = useCartStore();

  return {
    cart: store.cart,
    loading: store.loading,
    loaded: store.loaded,
    error: store.error,
  };
};

export default useCart;
