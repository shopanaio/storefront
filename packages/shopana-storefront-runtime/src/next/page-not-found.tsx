'use client';

import { notFound } from 'next/navigation';
import { PageNotFoundError } from '@shopana/storefront-sdk/core/PageNotFoundError';
import { useNavigationScope } from '../core/navigation-scope';

export {
  PageNotFoundError,
  isPageNotFoundError,
} from '@shopana/storefront-sdk/core/PageNotFoundError';

/**
 * Rendered by a section whose query finds no page (the entity of the address is gone). The
 * server answers that from `preload` with a 404 before rendering, so this is for a page loaded
 * on the client: inside a NavigationScope a PageNotFoundError goes to the app's boundary
 * around the page, so a missing page stays on its screen; outside one Next renders its
 * not-found page. Section boundaries pass both on.
 */
export function PageNotFound(): never {
  const scoped = useNavigationScope() !== null;
  if (scoped) throw new PageNotFoundError();
  notFound();
}
