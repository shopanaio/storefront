import type { model } from "@shopana/storefront-sdk";

/**
 * Returns the final price for the component (ProductGroupItem).
 * Backend has already applied BASE/ FIXED / FREE / PERCENT logic,
 * so it's enough to take the child product price.
 */
export const getGroupItemPrice = (
  item?: model.ProductGroupItem | null
): model.Money | undefined => {
  return item?.node?.price;
};
