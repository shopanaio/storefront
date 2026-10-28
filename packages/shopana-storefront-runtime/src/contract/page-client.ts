export * from '../core/page-client';
export {
  PageNotFoundError,
  isPageNotFoundError,
} from '@shopana/storefront-sdk/core/PageNotFoundError';

/**
 * Rendered by a section whose query finds no page (the entity of the address is gone). Inside
 * a NavigationScope a PageNotFoundError goes to the app's boundary around the page, so a
 * missing page stays on its screen; outside one the runtime renders its not-found page.
 */
export declare function PageNotFound(): never;
