import {
  ApolloClient,
  InMemoryCache,
  SSRMultipartLink,
} from '@apollo/client-integration-nextjs';
import { createApolloClient } from '../../graphql/apollo/Environment';
import type {
  ApolloEnvironmentConfig,
  CreateApolloClientOptions,
} from '../../graphql/apollo/types';

/** The storefront client for the Next.js integration: streaming SSR and RSC hydration. */
export function createNextApolloClient(
  config: ApolloEnvironmentConfig,
  options: CreateApolloClientOptions = {}
) {
  return createApolloClient(config, options, {
    InMemoryCache,
    // The cache is an instance of the integration's InMemoryCache passed above.
    createClient: (clientOptions) =>
      new ApolloClient(
        clientOptions as ConstructorParameters<typeof ApolloClient>[0]
      ),
    serverLinks: () => [new SSRMultipartLink({ stripDefer: true })],
  });
}
