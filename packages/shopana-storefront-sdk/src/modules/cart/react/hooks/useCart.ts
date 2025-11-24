import type { model } from '../../../../model';
import { useCartStore } from '../context';

type UseCart = () => {
  cart: model.Cart | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
};

const useCart: UseCart = () => {
  const cart = useCartStore((s) => s.cart);
  const loading = useCartStore((s) => s.loading);
  const loaded = useCartStore((s) => s.loaded);
  const error = useCartStore((s) => s.error);

  console.log('useCart store:', store);

  return {
    cart,
    loading,
    loaded,
    error,
  };
};

export default useCart;
