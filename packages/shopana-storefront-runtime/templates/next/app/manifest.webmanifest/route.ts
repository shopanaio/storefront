import { createPwaRouteHandlers } from '@shopana/storefront/next/pwa';
import { environmentConfig } from '@src/config/environment.config';
import pwa from '../pwa';

export const GET = createPwaRouteHandlers({ environmentConfig, pwa }).manifest;

export const dynamic = 'force-dynamic';
