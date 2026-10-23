import type { ApolloClient } from '@apollo/client';
import {
  SdkNavigationMenuByHandleDocument,
  SdkStorePolicyByHandleDocument,
} from '../../../graphql/apollo/generated/operations';

/** Loads navigation menus into the request cache so `useNavigationMenu` renders on the server. */
export async function preloadNavigationMenus(
  client: ApolloClient,
  handles: readonly string[]
): Promise<void> {
  await Promise.all(
    [...new Set(handles.filter(Boolean))].map((handle) =>
      client.query({
        query: SdkNavigationMenuByHandleDocument,
        variables: { handle },
      })
    )
  );
}

export async function loadStorePolicy(client: ApolloClient, handle: string) {
  const { data } = await client.query({
    query: SdkStorePolicyByHandleDocument,
    variables: { handle },
  });
  return data?.storePolicy ?? null;
}
