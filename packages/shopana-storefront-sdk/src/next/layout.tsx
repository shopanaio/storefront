/**
 * This file is exported as source (.tsx) via package.json exports.
 * All imports from SDK modules MUST use package imports (@shopana/storefront-sdk/...)
 * instead of relative imports (../modules/...) to ensure the same module instances
 * are used as external consumers.
 */
import type { ReactNode } from 'react';
import type { PageType } from '@shopana/storefront-sdk/core/types';
import { parseRoute } from '@shopana/storefront-sdk/utils/routeParser';
import { getRequestContext } from '@shopana/storefront-sdk/next/headers';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{
    slug?: string[];
  }>;
}

interface PageLayoutComponent {
  (props: { children: ReactNode }): ReactNode;
}

/**
 * Dynamic layout imports using switch.
 * Layouts are resolved from user project via @src/layouts/* path.
 * Returns null if no layout found for the pageType.
 */
async function loadLayout(pageType: PageType): Promise<PageLayoutComponent | null> {
  try {
    switch (pageType) {
      case 'home':
        return (await import('@/layouts/theme')).default;
      case 'product':
        return (await import('@/layouts/theme')).default;
      case 'collection':
        return (await import('@/layouts/theme')).default;
      case 'search':
        return (await import('@/layouts/theme')).default;
      case 'blog':
        return (await import('@/layouts/theme')).default;
      case 'article':
        return (await import('@/layouts/theme')).default;
      case 'page':
        return (await import('@/layouts/theme')).default;
      case 'cart':
        return (await import('@/layouts/theme')).default;
      case 'list-collections':
        return (await import('@/layouts/theme')).default;
      case '404':
        return null;
      default:
        return null;
    }
  } catch (error) {
    console.error(`Failed to load layout for pageType: ${pageType}`, error);
    return null;
  }
}

export interface CreateSDKLayoutOptions {
  /**
   * Optional: Override the default layout loading behavior
   */
  loadLayout?: (pageType: PageType) => Promise<PageLayoutComponent | null>;
}

/**
 * Factory function to create SDK layout exports with configuration.
 *
 * @example
 * ```tsx
 * // app/[locale]/(default)/[[...slug]]/layout.tsx
 * import { createSDKLayout } from '@shopana/storefront-sdk/next/layout';
 *
 * const { Layout } = createSDKLayout();
 *
 * export default Layout;
 * ```
 */
export function createSDKLayout(options: CreateSDKLayoutOptions = {}) {
  const layoutLoader = options.loadLayout ?? loadLayout;

  async function Layout({ children, params }: LayoutProps) {
    // Get URL context from middleware headers
    const requestContext = await getRequestContext();

    // Parse route from pathname to get pageType
    const { pageType } = parseRoute(requestContext.pathname);

    // Load layout dynamically based on pageType
    const LayoutComponent = await layoutLoader(pageType);

    // If no layout found, render children without wrapper
    if (!LayoutComponent) {
      return <>{children}</>;
    }

    return <LayoutComponent>{children}</LayoutComponent>;
  }

  return { Layout };
}
