/**
 * This file is exported as source (.tsx) via package.json exports.
 * The generated adapter supplies the project 404 template.
 */
import type { ReactNode } from 'react';
import type { PageTemplate } from '@shopana/storefront-sdk/core/types';
import { Builder } from '@shopana/storefront-sdk/core/Builder';

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

export interface CreateRuntimeNotFoundOptions {
  loadTemplate: () => Promise<PageTemplate | null>;

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
 * import { createRuntimeNotFound } from '@shopana/storefront/next/not-found';
 *
 * const { NotFound } = createRuntimeNotFound({ loadTemplate });
 *
 * export default NotFound;
 * ```
 */
export function createRuntimeNotFound(options: CreateRuntimeNotFoundOptions) {
  const templateLoader = options.loadTemplate;
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
