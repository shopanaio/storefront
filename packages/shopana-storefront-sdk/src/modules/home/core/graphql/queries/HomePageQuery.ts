import { SdkHomePageQueryDocument } from '../../../../../graphql/apollo/generated/operations';
import type {
  SdkHomePageQuery,
  SdkHomePageQueryVariables,
} from '../../../../../graphql/apollo/generated/operations';
export const HomePageQuery = SdkHomePageQueryDocument;
export interface HomePageQueryType {
  response: SdkHomePageQuery;
  variables: SdkHomePageQueryVariables;
}
