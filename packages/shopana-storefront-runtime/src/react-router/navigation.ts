import { redirect as routerRedirect } from 'react-router';
import { PageNotFoundError } from '@shopana/storefront-sdk/core/PageNotFoundError';

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

/** Ends a loader or a render with a temporary redirect to `url` (already localized). */
export function redirect(url: string): never {
  throw routerRedirect(url, 307);
}

/** Ends a loader or a render with a permanent redirect to `url` (already localized). */
export function permanentRedirect(url: string): never {
  throw routerRedirect(url, 308);
}
