'use client';

import { useQuery } from '@apollo/client/react';
import {
  SdkNavigationMenuByHandleDocument,
  type SdkNavigationMenuFragment,
} from '../../../graphql/apollo/generated/operations';

export type NavigationMenu = SdkNavigationMenuFragment;
export type NavigationMenuItem = NavigationMenu['items']['nodes'][number];
export type NavigationMenuGroup =
  NavigationMenuItem['children']['nodes'][number];
export type NavigationMenuLink =
  NavigationMenuGroup['children']['nodes'][number];

const EMPTY_ITEMS: readonly NavigationMenuItem[] = [];

/**
 * A navigation menu by handle. Menus the layout preloads on the server are read from the cache,
 * so the header and footer are part of the server HTML.
 */
export function useNavigationMenu(handle: string | null | undefined) {
  const query = useQuery(SdkNavigationMenuByHandleDocument, {
    variables: { handle: handle ?? '' },
    skip: !handle,
    fetchPolicy: 'cache-first',
  });
  const menu = query.data?.onlineStoreNavigationMenuByHandle ?? null;
  return {
    menu,
    items: menu?.items.nodes ?? EMPTY_ITEMS,
    loading: query.loading,
    error: query.error,
  };
}
