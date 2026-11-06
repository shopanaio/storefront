import {
  index,
  layout,
  route,
  type RouteConfig,
} from '@react-router/dev/routes';

export default [
  route('auth/headless/:action', 'routes/auth-headless.ts'),
  route('auth/:action', 'routes/auth.ts'),
  route('manifest.webmanifest', 'routes/manifest.ts'),
  route('sw.js', 'routes/sw.ts'),
  route('robots.txt', 'routes/robots.ts'),
  route('sitemap.xml', 'routes/sitemap.ts'),
  route('sitemaps/:file', 'routes/sitemap-file.ts'),
  // `[[...slug]]`: the home page and every other address, under the page layout.
  layout('routes/layout.tsx', [
    index('routes/page.tsx', { id: 'routes/home' }),
    route('*', 'routes/page.tsx'),
  ]),
] satisfies RouteConfig;
