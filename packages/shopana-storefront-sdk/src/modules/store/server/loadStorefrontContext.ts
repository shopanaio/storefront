import type { ApolloClient } from '@apollo/client';
import {
  SdkStorefrontContextDocument,
  type SdkStorefrontContextQuery,
} from '../../../graphql/apollo/generated/operations';

/**
 * Store and localization of the request, read with the request-scoped client so the result is
 * part of the cache snapshot sent to the browser.
 */
export async function loadStorefrontContext(
  client: ApolloClient
): Promise<SdkStorefrontContextQuery> {
  const { data } = await client.query({ query: SdkStorefrontContextDocument });
  if (!data) {
    throw new Error('Storefront context query returned no data');
  }
  return data;
}
