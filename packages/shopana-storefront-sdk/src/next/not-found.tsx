/**
 * This file is exported as source (.tsx) via package.json exports.
 * All imports from SDK modules MUST use package imports (@shopana/storefront-sdk/...)
 * instead of relative imports (../modules/...) to ensure the same module instances
 * are used as external consumers.
 */
import type { ReactNode } from 'react';
import type { PageTemplate } from '../core/types';
import { Builder } from '../core/Builder';

/**
 * Default 404 template loader.
 * Loads template from user project via @src/templates/404/index path.
 */
async function loadNotFoundTemplate(): Promise<PageTemplate | null> {
  try {
    return (await import('@src/templates/404/index')).default;
  } catch (error) {
    console.error('Failed to load 404 template:', error);
    return null;
  }
}

/**
 * Default fallback component when no template is available.
 */
function DefaultNotFound(): ReactNode {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}

export interface CreateSDKNotFoundOptions {
  /**
   * Optional: Override the default template loading behavior.
   * Return your custom template or null to use the fallback.
   */
  loadTemplate?: () => Promise<PageTemplate | null>;

  /**
   * Optional: Custom fallback component when template fails to load.
   */
  fallback?: () => ReactNode;
}

/**
 * Factory function to create SDK not-found page exports with configuration.
 *
 * @example
 * ```tsx
 * // app/[locale]/not-found.tsx
 * import { createSDKNotFound } from '@shopana/storefront-sdk/next/not-found';
 *
 * const { NotFound } = createSDKNotFound();
 *
 * export default NotFound;
 * ```
 *
 * @example
 * ```tsx
 * // With custom fallback
 * import { createSDKNotFound } from '@shopana/storefront-sdk/next/not-found';
 * import { Custom404 } from '@src/components/Custom404';
 *
 * const { NotFound } = createSDKNotFound({
 *   fallback: () => <Custom404 />,
 * });
 *
 * export default NotFound;
 * ```
 */
export function createSDKNotFound(options: CreateSDKNotFoundOptions = {}) {
  const templateLoader = options.loadTemplate ?? loadNotFoundTemplate;
  const FallbackComponent = options.fallback ?? DefaultNotFound;

  async function NotFound() {
    const template = await templateLoader();

    if (!template) {
      return <FallbackComponent />;
    }

    return (
      <Builder
        template={template}
        data={null}
        pageType="404"
        fallback={<div>Loading...</div>}
      />
    );
  }

  return { NotFound };
}
