import type {
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client';
import { registerApolloClient } from '@apollo/client-integration-nextjs';
import { loadSerializableQuery } from '../../graphql/apollo/loadSerializableQuery';
import { readRequestAuth } from '../../server/apollo';
import { apolloEnvironmentKey } from '../../server/requestClient';
import { createNextApolloClient } from './createNextApolloClient';
import type {
  ApolloEnvironmentConfig,
  CreateApolloClientOptions,
} from '../../graphql/apollo/types';

export type ApolloServerClientOptions = Omit<
  CreateApolloClientOptions,
  'serverCookies' | 'initialState' | 'accessToken' | 'locale'
>;

const requestClientRegistrations = new Map<
  string,
  ReturnType<typeof registerApolloClient>
>();

function getDefaultRegistration(environmentConfig: ApolloEnvironmentConfig) {
  const key = apolloEnvironmentKey(environmentConfig);
  const existing = requestClientRegistrations.get(key);
  if (existing) return existing;

  const registration = registerApolloClient(async () =>
    createNextApolloClient(environmentConfig, await readRequestAuth())
  );
  requestClientRegistrations.set(key, registration);
  return registration;
}

/**
 * The client of the current Next.js server request; `getApolloRequestClient` of
 * `@shopana/storefront-sdk/server/apollo` answers with it under Next.js.
 */
export function getNextApolloRequestClient(
  environmentConfig: ApolloEnvironmentConfig
) {
  return getDefaultRegistration(environmentConfig).getClient();
}

/**
 * Registers a request-scoped Apollo client for React Server Components.
 * Call once in a server-only module and export query/getClient/PreloadQuery.
 */
export function createApolloNextClient(
  environmentConfig: ApolloEnvironmentConfig,
  clientOptions: ApolloServerClientOptions = {}
) {
  if (Object.keys(clientOptions).length === 0) {
    return getDefaultRegistration(environmentConfig);
  }

  return registerApolloClient(async () =>
    createNextApolloClient(environmentConfig, {
      ...clientOptions,
      ...(await readRequestAuth()),
    })
  );
}

/**
 * Imperative counterpart to PreloadQuery for loaders and metadata functions.
 * Prefer PreloadQuery when the result is consumed by a Client Component.
 */
export function createApolloServerQueryLoader(
  environmentConfig: ApolloEnvironmentConfig,
  clientOptions: ApolloServerClientOptions = {}
) {
  const { getClient } = createApolloNextClient(
    environmentConfig,
    clientOptions
  );

  return async function loadServerQuery<
    TData,
    TVariables extends OperationVariables,
  >(
    query: DocumentNode | TypedDocumentNode<TData, TVariables>,
    variables: TVariables
  ) {
    return loadSerializableQuery(await getClient(), query, variables);
  };
}

export type {
  ApolloEnvironmentConfig,
  CreateApolloClientOptions,
} from '../../graphql/apollo/types';
export type { SerializableApolloQuery } from '../../graphql/apollo/loadSerializableQuery';
export type {
  PreloadQueryProps,
  TransportedQueryRef,
} from '@apollo/client-integration-nextjs';
