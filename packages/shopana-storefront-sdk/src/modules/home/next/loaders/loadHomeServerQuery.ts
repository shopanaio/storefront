import {
  loadSerializableQuery,
  type SerializableApolloQuery,
} from '../../../../graphql/apollo/loadSerializableQuery';
import { getApolloRequestClient } from '../../../../next/apollo/server';
import type { ApolloEnvironmentConfig } from '../../../../graphql/apollo/types';
import {
  SdkHomePageQueryDocument,
  type SdkHomePageQuery,
  type SdkHomePageQueryVariables,
} from '../../../../graphql/apollo/generated/operations';
export interface LoadHomeServerQueryOptions {
  environmentConfig: ApolloEnvironmentConfig;
}
export async function loadHomeServerQuery(
  options: LoadHomeServerQueryOptions
): Promise<
  SerializableApolloQuery<SdkHomePageQuery, SdkHomePageQueryVariables>
> {
  const { environmentConfig } = options;
  const client = await getApolloRequestClient(environmentConfig);
  return loadSerializableQuery(client, SdkHomePageQueryDocument, {});
}
export type { SdkHomePageQuery as HomePageQueryType };
