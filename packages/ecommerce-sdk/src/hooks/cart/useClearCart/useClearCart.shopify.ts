import { ClearCartInput, UseClearCartReturn } from "./interface";

/**
 * Shopify implementation stub for useClearCart hook
 * TODO: Implement when Shopify clear cart functionality is needed
 */
const useClearCart = (): UseClearCartReturn => {
  return {
    clearCart: async (
      input?: ClearCartInput,
      options?: {
        onSuccess?: () => void;
        onError?: () => void;
      }
    ): Promise<any> => {
      console.warn("[useClearCart.shopify] Not implemented yet");
      options?.onError?.();
      return Promise.reject(new Error("useClearCart not implemented for Shopify"));
    },
    loading: false,
  };
};

export default useClearCart;
