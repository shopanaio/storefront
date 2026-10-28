import { redirect as routerRedirect } from 'react-router';
import { PageNotFoundError } from '@shopana/storefront-sdk/core/PageNotFoundError';
import { recordRenderRedirect } from './render-redirect';

export {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from './navigation-client';
export type {
  NavigateOptions,
  ReadonlySearchParams,
  StorefrontRouteParams,
  StorefrontRouter,
} from '../core/facade-types';
export {
  NavigationScope,
  useNavigationScope,
  type NavigationHandler,
  type NavigationScopeProps,
  type NavigationTarget,
} from '../core/navigation-scope';

/**
 * Ends a loader or a render with the not-found page: the page route answers a 404 with the
 * theme's 404 page.
 */
export function notFound(): never {
  throw new PageNotFoundError();
}

/**
 * A redirect thrown from a loader or a render. React Router keeps only the status of a
 * response thrown while the server renders, so the address is kept in the request too, for
 * the server entry to answer with.
 */
function throwRedirect(url: string, status: number): never {
  recordRenderRedirect({ location: url, status });
  throw routerRedirect(url, status);
}

/** Ends a loader or a render with a temporary redirect to `url` (already localized). */
export function redirect(url: string): never {
  throwRedirect(url, 307);
}

/** Ends a loader or a render with a permanent redirect to `url` (already localized). */
export function permanentRedirect(url: string): never {
  throwRedirect(url, 308);
}
