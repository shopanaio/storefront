import { headers } from 'next/headers';
import { cache } from 'react';
import {
  SDK_URL_HEADER,
  SDK_PATHNAME_HEADER,
  SDK_SEARCH_HEADER,
  SDK_HOST_HEADER,
} from './middleware';

export interface SDKRequestContext {
  url: string;
  pathname: string;
  search: string;
  host: string;
  searchParams: URLSearchParams;
}

/**
 * Gets the request URL context from headers set by SDK middleware.
 * This function is cached per request using React's cache().
 *
 * @example
 * ```tsx
 * // In a server component
 * import { getRequestContext } from '@shopana/storefront-sdk/next/headers';
 *
 * export default async function Page() {
 *   const ctx = await getRequestContext();
 *   console.log(ctx.pathname); // /ru/products/my-product
 *   console.log(ctx.searchParams.get('sort')); // price
 * }
 * ```
 */
export const getRequestContext = cache(
  async (): Promise<SDKRequestContext> => {
    const h = await headers();

    const url = h.get(SDK_URL_HEADER) || '';
    const pathname = h.get(SDK_PATHNAME_HEADER) || '/';
    const search = h.get(SDK_SEARCH_HEADER) || '';
    const host = h.get(SDK_HOST_HEADER) || '';

    return {
      url,
      pathname,
      search,
      host,
      searchParams: new URLSearchParams(search),
    };
  }
);
