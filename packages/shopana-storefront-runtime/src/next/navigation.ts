export * from 'next/navigation';
// Named exports win over the star export: the storefront's own versions of these hooks.
export {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
  type StorefrontRouter,
} from './navigation-client';
export {
  NavigationScope,
  useNavigationScope,
  type NavigationHandler,
  type NavigationScopeProps,
  type NavigationTarget,
} from './navigation-scope';
