import {
  index,
  layout,
  route,
  type RouteConfig,
} from '@react-router/dev/routes';

export default [
  route('auth/headless/:action', 'routes/auth-headless.ts'),
  route('auth/:action', 'routes/auth.ts'),
  // `[[...slug]]`: the home page and every other address, under the page layout.
  layout('routes/layout.tsx', [
    index('routes/page.tsx', { id: 'routes/home' }),
    route('*', 'routes/page.tsx'),
  ]),
] satisfies RouteConfig;
