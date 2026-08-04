import { SdkProductQueryDocument } from '../../../../../graphql/apollo/generated/operations';
import type {
  SdkProductQuery,
  SdkProductQueryVariables,
} from '../../../../../graphql/apollo/generated/operations';
export const ProductQuery = SdkProductQueryDocument;
export interface ProductQueryType {
  response: SdkProductQuery;
  variables: SdkProductQueryVariables;
}
