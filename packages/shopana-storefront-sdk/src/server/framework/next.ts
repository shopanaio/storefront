/**
 * The server request of Next.js, for the server modules running outside a request scope. The
 * package resolves `#server-framework` here by default, and to `none` under the `react-router`
 * condition, so a React Router build bundles nothing of Next.js.
 */
import type { ApolloClient } from '@apollo/client';
import type { ApolloEnvironmentConfig } from '../../graphql/apollo/types';
import type { ServerRequestHeaders } from '../requestScope';

export async function readFrameworkRequestHeaders(): Promise<ServerRequestHeaders> {
  const { headers } = await import('next/headers');
  return headers();
}

export async function getFrameworkApolloRequestClient(
  config: ApolloEnvironmentConfig
): Promise<ApolloClient> {
  const { getNextApolloRequestClient } =
    await import('../../next/apollo/server');
  return getNextApolloRequestClient(config);
}
