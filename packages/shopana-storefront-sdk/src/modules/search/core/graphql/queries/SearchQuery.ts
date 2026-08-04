import { SdkSearchQueryDocument } from '../../../../../graphql/apollo/generated/operations';
import type {
  SdkSearchQuery,
  SdkSearchQueryVariables,
} from '../../../../../graphql/apollo/generated/operations';
export const SearchQuery = SdkSearchQueryDocument;
export interface SearchQueryType {
  response: SdkSearchQuery;
  variables: SdkSearchQueryVariables;
}
