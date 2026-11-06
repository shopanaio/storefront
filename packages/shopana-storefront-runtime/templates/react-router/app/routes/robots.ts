import { createSeoRoutes } from '@shopana/storefront/react-router/seo';
import runtimeApp from '@src/runtime/app';
import seo from '../seo';

export const loader = createSeoRoutes(runtimeApp, seo).robotsLoader;
