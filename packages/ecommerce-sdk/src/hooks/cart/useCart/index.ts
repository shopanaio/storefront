import type { Entity } from '@shopana/entity';
import { useCartStore } from '@src/store/cartStore';

type UseCart = () => {
  cart: Entity.Cart | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
};

const useCart: UseCart = () => {
  const cart = useCartStore((state) => state.cart);
  const loading = useCartStore((state) => state.loading);
  const loaded = useCartStore((state) => state.loaded);
  const error = useCartStore((state) => state.error);

  return {
    cart,
    loading,
    loaded,
    error,
  };
};

export default useCart;
