import { SdkCollectionQueryDocument } from '../../../../../graphql/apollo/generated/operations';
import type {
  SdkCollectionQuery,
  SdkCollectionQueryVariables,
} from '../../../../../graphql/apollo/generated/operations';
export const CollectionQuery = SdkCollectionQueryDocument;
export interface CollectionQueryType {
  response: SdkCollectionQuery;
  variables: SdkCollectionQueryVariables;
}
