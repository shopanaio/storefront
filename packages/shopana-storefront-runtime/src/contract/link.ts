import type { LinkComponent } from '../core/facade-types';

export type { LinkComponent, LinkProps } from '../core/facade-types';

/**
 * A link that keeps the active locale in storefront paths. Inside a NavigationScope it is a
 * plain anchor whose clicks go to the scope; the real href stays for crawlers and new tabs.
 */
export declare const Link: LinkComponent;
export default Link;
