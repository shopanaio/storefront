// Server-safe: callable from server components, unlike the hooks of the client module.
export { notFound, permanentRedirect, redirect } from 'next/navigation';
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
