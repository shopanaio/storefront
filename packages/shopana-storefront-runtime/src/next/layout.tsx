/**
 * This file is exported as source (.tsx) via package.json exports.
 * The generated adapter supplies project layouts, keeping this package independent
 * from the consuming storefront's source tree.
 */
import type { ReactNode } from 'react';
import { getRequestContext } from './headers';
import { resolveRuntimeRoute, type RuntimePageType } from '../core/route';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{
    locale?: string;
    slug?: string[];
  }>;
}

interface PageLayoutComponent {
  (props: { children: ReactNode }): ReactNode;
}

export interface CreateRuntimeLayoutOptions {
  modulesContext?: ReturnType<typeof require.context>;
  loadLayout: (
    pageType: RuntimePageType,
    context: { isModule: boolean; moduleSlug?: string }
  ) => Promise<PageLayoutComponent | null>;
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
  const modulesContext = options.modulesContext;

  if (modulesContext) {
    modulesContext.keys().forEach((key) => modulesContext(key));
  }

  async function Layout({ children, params }: LayoutProps) {
    const { locale } = await params;
    const requestContext = await getRequestContext();
    const resolution = resolveRuntimeRoute(requestContext.pathname, locale);
    if (resolution.kind === 'module' && resolution.match.record.layoutLoader) {
      const { default: ModuleLayout } =
        await resolution.match.record.layoutLoader();
      return <ModuleLayout>{children}</ModuleLayout>;
    }

    const LayoutComponent = await layoutLoader(resolution.pageType, {
      isModule: resolution.kind === 'module',
      moduleSlug:
        resolution.kind === 'module' ? resolution.match.record.slug : undefined,
    });

    // If no layout found, render children without wrapper
    if (!LayoutComponent) {
      return <>{children}</>;
    }

    return <LayoutComponent>{children}</LayoutComponent>;
  }

  return { Layout };
}
