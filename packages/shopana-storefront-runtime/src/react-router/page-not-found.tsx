'use client';

import { PageNotFoundError } from '@shopana/storefront-sdk/core/PageNotFoundError';
import { useNavigationScope } from '../core/navigation-scope';
import { notFoundResponse } from './not-found-response';

export {
  PageNotFoundError,
  isPageNotFoundError,
} from '@shopana/storefront-sdk/core/PageNotFoundError';

/**
 * Rendered by a section whose query finds no page (the entity of the address is gone): a page
 * whose `preload` did not cover the query, or one loaded in the browser. Inside a
 * NavigationScope a PageNotFoundError goes to the app's boundary around the page, so a missing
 * page stays on its screen; otherwise the page route renders the 404 page, with status 404 when
 * the server renders it. Section boundaries pass both on.
 */
export function PageNotFound(): never {
  const scoped = useNavigationScope() !== null;
  if (scoped) throw new PageNotFoundError();
  throw notFoundResponse();
}
