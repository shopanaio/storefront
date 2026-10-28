'use client';

import { notFound } from 'next/navigation';
import { PageNotFoundError } from '@shopana/storefront-sdk/core/PageNotFoundError';

export {
  PageNotFoundError,
  isPageNotFoundError,
} from '@shopana/storefront-sdk/core/PageNotFoundError';

/**
 * Rendered by a section whose query finds no page (the entity of the address is gone). On the
 * server Next renders its not-found page. On the client, where pages render without the Next
 * router (a storefront page, a stack screen), a PageNotFoundError goes to the boundary around the
 * page, so a missing page stays in its place. Section boundaries pass both on.
 */
export function PageNotFound(): never {
  if (typeof window !== 'undefined') throw new PageNotFoundError();
  notFound();
}
