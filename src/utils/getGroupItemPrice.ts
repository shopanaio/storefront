import type * as Entity from "@src/entity/namespace";

/**
 * Returns the final price for the component (ProductGroupItem).
 * Backend has already applied BASE/ FIXED / FREE / PERCENT logic,
 * so it's enough to take the child product price.
 */
export const getGroupItemPrice = (
  item?: Entity.ProductGroupItem | null
): Entity.Money | undefined => {
  return item?.node?.price;
};
