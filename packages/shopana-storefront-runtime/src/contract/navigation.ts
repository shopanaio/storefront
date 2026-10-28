import type {
  ReadonlySearchParams,
  StorefrontRouteParams,
  StorefrontRouter,
} from '../core/facade-types';

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
 * Router whose moves keep the active locale. Inside a NavigationScope no call reaches the
 * framework router: push and replace go to the scope, back and forward walk the browser
 * history, refresh reloads the page at its real address.
 */
export declare function useRouter(): StorefrontRouter;

/**
 * Current pathname without the locale segment: inside a NavigationScope with `href` that
 * page's own.
 */
export declare function usePathname(): string;

/** Current search params: inside a NavigationScope with `href` that page's own. */
export declare function useSearchParams(): ReadonlySearchParams;

/** Route params of the storefront route: `locale` and `slug`. */
export declare function useParams<
  T extends StorefrontRouteParams = StorefrontRouteParams,
>(): T;

/** Ends rendering or loading with the not-found page (404). */
export declare function notFound(): never;

/** Ends rendering or loading with a temporary redirect to `url` (already localized). */
export declare function redirect(url: string): never;

/** Ends rendering or loading with a permanent redirect to `url` (already localized). */
export declare function permanentRedirect(url: string): never;
