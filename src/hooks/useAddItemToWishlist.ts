import { useCallback } from "react";

export const useAddItemToWishlist = () => {
  const addItem = useCallback(async (productId: string) => {
    console.log(`Added product ${productId} to wishlist`);
  }, []);

  return { addItem };
};
