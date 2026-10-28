import { createRuntimeLayoutRoute } from '@shopana/storefront/react-router/page';
import ErrorPage from '@src/runtime/error';
import { pageRoute } from '../page-route';

const route = createRuntimeLayoutRoute({ ...pageRoute, ErrorPage });

export const ErrorBoundary = route.ErrorBoundary;
export default route.Layout;
