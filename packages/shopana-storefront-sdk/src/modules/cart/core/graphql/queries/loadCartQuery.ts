import { SdkLoadCartQueryDocument } from '../../../../../graphql/apollo/generated/operations';
import '../fragments/CartFragment';

/**
 * Query for loading cart by checkout ID
 * Uses checkoutQuery to fetch checkout data
 */
export const loadCartQuery = SdkLoadCartQueryDocument;
