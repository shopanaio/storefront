import { createRuntimeRoot } from '@shopana/storefront/react-router/root';
import {
  createRuntimeMiddleware,
  loadRuntimeRoot,
} from '@shopana/storefront/react-router/server';
import runtimeApp from '@src/runtime/app';
import ErrorPage from '@src/runtime/error';
import * as layout from '@src/runtime/layout';
import themeMiddleware from './middleware';

const root = createRuntimeRoot({ app: runtimeApp, layout, ErrorPage });

export const middleware = [
  createRuntimeMiddleware(runtimeApp),
  ...themeMiddleware,
];
export const loader = () => loadRuntimeRoot(runtimeApp);
export const shouldRevalidate = root.shouldRevalidate;
export const meta = root.meta;
export const links = root.links;
export const Layout = root.Layout;
export const ErrorBoundary = root.ErrorBoundary;
export default root.App;
