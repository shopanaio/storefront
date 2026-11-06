import { createSeoRouteHandlers } from '@shopana/storefront/next/seo';
import { environmentConfig } from '@src/config/environment.config';
import { storefrontRouting } from '@src/config/routing.config';
import seo from '../../seo';

export const GET = createSeoRouteHandlers({
  environmentConfig,
  routing: storefrontRouting,
  seo,
}).sitemapFile;

export const dynamic = 'force-dynamic';
