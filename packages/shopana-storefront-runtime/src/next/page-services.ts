import type { NormalizedCacheObject } from '@apollo/client';
import { loadSerializableQuery } from '@shopana/storefront-sdk/next/apollo/loadSerializableQuery';
import { getApolloRequestClient } from '@shopana/storefront-sdk/next/apollo/server';
import type { ApolloEnvironmentConfig } from '@shopana/storefront-sdk/graphql/apollo/types';
import type { RuntimePageServices } from './page-definition';

export function createRuntimePageServices(
  environmentConfig: ApolloEnvironmentConfig
): RuntimePageServices {
  return {
    async loadQuery(document, variables) {
      const client = await getApolloRequestClient(environmentConfig);
      return loadSerializableQuery(client, document, variables);
    },

    async extractCacheState() {
      const client = await getApolloRequestClient(environmentConfig);
      return client.extract() as NormalizedCacheObject;
    },
  };
}
