import type { ApiMoney, ApiProductGroupItem } from "@codegen/schema-client";

/**
 * Returns the final price for the component (ProductGroupItem).
 * Backend has already applied BASE/ FIXED / FREE / PERCENT logic,
 * so it's enough to take the child product price.
 */
export const getGroupItemPrice = (
  item?: ApiProductGroupItem | null
): ApiMoney | undefined => {
  return item?.product?.price;
};
