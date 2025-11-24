import type { model } from '../../../../model';
import { useCartStore } from '../context';

type UseCart = () => {
  cart: model.Cart | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
};

const useCart: UseCart = () => {
  const useStore = useCartStore();

  const cart = useStore((s) => s.cart);
  const loading = useStore((s) => s.loading);
  const loaded = useStore((s) => s.loaded);
  const error = useStore((s) => s.error);

  return {
    cart,
    loading,
    loaded,
    error,
  };
};

export default useCart;
