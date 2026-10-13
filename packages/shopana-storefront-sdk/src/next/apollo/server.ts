import type {
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client';
import { registerApolloClient } from '@apollo/client-integration-nextjs';
import { createApolloClient } from '../../graphql/apollo/Environment';
import { loadSerializableQuery } from '../../graphql/apollo/loadSerializableQuery';
import type {
  ApolloEnvironmentConfig,
  CreateApolloClientOptions,
} from '../../graphql/apollo/types';

export type ApolloServerClientOptions = Omit<
  CreateApolloClientOptions,
  'serverCookies' | 'initialState'
>;

const requestClientRegistrations = new Map<
  string,
  ReturnType<typeof registerApolloClient>
>();

function environmentKey(config: ApolloEnvironmentConfig): string {
  return JSON.stringify([
    config.graphqlUrl,
    config.apiKeyHeader,
    config.apiKey,
    config.applicationAuth,
  ]);
}

function getDefaultRegistration(environmentConfig: ApolloEnvironmentConfig) {
  const key = environmentKey(environmentConfig);
  const existing = requestClientRegistrations.get(key);
  if (existing) return existing;

  const registration = registerApolloClient(async () => {
    const { headers } = await import('next/headers');
    const serverCookies = (await headers()).get('cookie') ?? undefined;
    return createApolloClient(environmentConfig, { serverCookies });
  });
  requestClientRegistrations.set(key, registration);
  return registration;
}

/** Returns the shared Apollo Client for the current Next.js server request. */
export function getApolloRequestClient(
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

  return registerApolloClient(async () => {
    const { headers } = await import('next/headers');
    const serverCookies = (await headers()).get('cookie') ?? undefined;

    return createApolloClient(environmentConfig, {
      ...clientOptions,
      serverCookies,
    });
  });
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
