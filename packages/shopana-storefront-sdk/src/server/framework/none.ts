/**
 * No framework request: under React Router every server request runs in a request scope, and
 * a server module called outside of one is a mistake.
 */
import type { ApolloClient } from '@apollo/client';
import type { ApolloEnvironmentConfig } from '../../graphql/apollo/types';
import type { ServerRequestHeaders } from '../requestScope';

function outsideRequest(): never {
  throw new Error(
    'The storefront server modules run inside a server request: a loader, a middleware or the server render'
  );
}

export async function readFrameworkRequestHeaders(): Promise<ServerRequestHeaders> {
  outsideRequest();
}

export async function getFrameworkApolloRequestClient(
  config: ApolloEnvironmentConfig
): Promise<ApolloClient> {
  void config;
  outsideRequest();
}
