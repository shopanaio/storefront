'use client';

import { PageNotFoundError } from '@shopana/storefront-sdk/core/PageNotFoundError';

export {
  PageNotFoundError,
  isPageNotFoundError,
} from '@shopana/storefront-sdk/core/PageNotFoundError';

/**
 * Rendered by a section whose query finds no page (the entity of the address is gone). The
 * server answers that from `preload` with a 404 before rendering, so this is for a page loaded
 * on the client. The PageNotFoundError goes to the nearest boundary: inside a NavigationScope
 * the app's boundary around the page, so a missing page stays on its screen; otherwise the page
 * route's, which renders the not-found page. Section boundaries pass it on.
 */
export function PageNotFound(): never {
  throw new PageNotFoundError();
}
