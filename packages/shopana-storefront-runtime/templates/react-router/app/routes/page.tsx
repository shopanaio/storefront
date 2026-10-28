import { createRuntimePageRoute } from '@shopana/storefront/react-router/page';
import { createRuntimePageLoader } from '@shopana/storefront/react-router/server';
import runtimeApp from '@src/runtime/app';
import ErrorPage from '@src/runtime/error';
import { pageRoute } from '../page-route';

const route = createRuntimePageRoute({ ...pageRoute, ErrorPage });

export const loader = createRuntimePageLoader(runtimeApp, pageRoute);
export const clientLoader = route.clientLoader;
export const meta = route.meta;
export const ErrorBoundary = route.ErrorBoundary;
export default route.Page;
