import type { model } from '../../../../model/namespace';
import type { CartRecommendationLineInput } from '../../../../graphql/apollo/generated/operations';

const MAX_LINES = 100;
const MAX_COMPONENTS = 200;

/**
 * Input lines of `cartRecommendations` for a cart: root lines, the most recently added first
 * (the checkout lists lines in the order they were added), with the variants of their bundle
 * components so the components are not recommended either. Child lines are not separate
 * anchors. Within the API limits: 100 lines and 200 components.
 */
export function cartRecommendationLines(
  lines: readonly model.CartLine[]
): CartRecommendationLineInput[] {
  let components = 0;
  return lines
    .filter((line) => line.isOptimistic || line.parentId === null)
    .reverse()
    .slice(0, MAX_LINES)
    .map((line) => {
      const children = line.isOptimistic
        ? []
        : line.children
            .map((child) => child.purchasableId)
            .slice(0, Math.max(0, MAX_COMPONENTS - components));
      components += children.length;
      return children.length
        ? {
            purchasableId: line.purchasableId,
            componentPurchasableIds: children,
          }
        : { purchasableId: line.purchasableId };
    });
}
