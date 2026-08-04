import { SdkReplaceCartItemMutationDocument } from '../../../../../graphql/apollo/generated/operations';
import '../fragments/CartFragment';

/**
 * Mutation for replacing cart items
 * Moves quantity from one cart line to a different purchasable (product variant)
 */
export const replaceCartItemMutation = SdkReplaceCartItemMutationDocument;
