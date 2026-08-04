/**
 * This file is exported as source (.tsx) via package.json exports.
 * The generated adapter supplies project layouts, keeping this package independent
 * from the consuming storefront's source tree.
 */
import type { ReactNode } from 'react';
import type { PageType } from '@shopana/storefront-sdk/core/types';
import { parseRoute } from '@shopana/storefront-sdk/utils/routeParser';
import { getRequestContext } from '@shopana/storefront/next/headers';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{
    slug?: string[];
  }>;
}

interface PageLayoutComponent {
  (props: { children: ReactNode }): ReactNode;
}

export interface CreateRuntimeLayoutOptions {
  loadLayout: (pageType: PageType) => Promise<PageLayoutComponent | null>;
}

/**
 * Factory function to create SDK layout exports with configuration.
 *
 * @example
 * ```tsx
 * // app/[locale]/(default)/[[...slug]]/layout.tsx
 * import { createRuntimeLayout } from '@shopana/storefront/next/layout';
 *
 * const { Layout } = createRuntimeLayout({ loadLayout });
 *
 * export default Layout;
 * ```
 */
export function createRuntimeLayout(options: CreateRuntimeLayoutOptions) {
  const layoutLoader = options.loadLayout;

  async function Layout({ children }: LayoutProps) {
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
