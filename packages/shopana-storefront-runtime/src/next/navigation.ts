// The Next router takes no part in client navigation (see storefront-history): from Next only
// what runs on the server (redirects, not-found) and server-inserted HTML; the navigation
// hooks are the storefront's own.
export {
  forbidden,
  notFound,
  permanentRedirect,
  redirect,
  RedirectType,
  ServerInsertedHTMLContext,
  unauthorized,
  unstable_isUnrecognizedActionError,
  unstable_rethrow,
  useServerInsertedHTML,
} from 'next/navigation';
export {
  ReadonlyURLSearchParams,
  useHistoryLocation,
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
  type NavigateOptions,
  type StorefrontRouter,
} from './navigation-client';
export {
  NavigationScope,
  useNavigationScope,
  type NavigationHandler,
  type NavigationScopeProps,
  type NavigationTarget,
} from './navigation-scope';
