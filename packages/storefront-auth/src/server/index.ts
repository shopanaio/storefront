/**
 * Server-only headless sign-in (BFF). Import it from route handlers only: it reads the IAM
 * client secret and the session key from the server environment.
 */
export {
  createHeadlessAuthRouteHandlers,
  type HeadlessAuthRouteHandlers,
  type RouteContext,
} from './routes';
export { IamHeadlessClient, IamHeadlessError } from './iamHeadless';
