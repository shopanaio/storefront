import type { ApolloEnvironmentConfig } from '../../../../graphql/apollo/types';
import { ApplicationAuthClient } from '../../core/ApplicationAuthClient';
import type { Session } from '../../core/types';

export interface LoadSessionServerQueryOptions {
  environmentConfig: ApolloEnvironmentConfig;
  serverCookies?: string;
}

/** Loads the OpenID user from IAM using the OAuth access token cookie. */
export async function loadSessionServerQuery({
  environmentConfig,
  serverCookies,
}: LoadSessionServerQueryOptions): Promise<Session | null> {
  try {
    return await new ApplicationAuthClient(
      environmentConfig.applicationAuth
    ).getSession(serverCookies);
  } catch {
    return null;
  }
}
