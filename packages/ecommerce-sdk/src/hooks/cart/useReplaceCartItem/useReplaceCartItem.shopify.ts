import { ReplaceCartItemInput } from "./interface";

/**
 * Shopify implementation placeholder for useReplaceCartItem.
 * Shopify Storefront API doesn't have a direct equivalent for replacing cart lines.
 * This would need to be implemented using cartLinesRemove + cartLinesAdd if needed.
 */
const useReplaceCartItem = () => {
  const replaceCartItem = async (
    input: ReplaceCartItemInput,
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => {
    console.warn(
      "[useReplaceCartItem] Not implemented for Shopify. " +
      "Use removeFromCart + addToCart as alternative."
    );
    options?.onError?.();
    return Promise.reject(new Error("Not implemented for Shopify"));
  };

  return { replaceCartItem, loading: false };
};

export default useReplaceCartItem;
