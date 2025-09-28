/**
 * Input interface for clearing the entire cart
 */
export interface ClearCartInput {
  checkoutId: string;
}

/**
 * Return type for useClearCart hook
 */
export interface UseClearCartReturn {
  clearCart: (
    input?: ClearCartInput,
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => Promise<any>;
  loading: boolean;
}
