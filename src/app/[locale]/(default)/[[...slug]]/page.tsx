import React from 'react';
import { createSDKPage } from '@shopana/storefront-sdk/next/page';
import { environmentConfig } from '@src/config/environment.config';
import '@src/modules';
import {
  moduleRegistry,
  type DynamicModulePageProps,
  type ModuleExport,
  type AsyncModuleLoader,
} from '@src/modules/registry';

const { Page: SDKPage, generateMetadata } = createSDKPage({
  environmentConfig,
});

/**
 * Extracts component from a module namespace or returns the component itself.
 */
function getComponentFromModule(
  input: ModuleExport<DynamicModulePageProps>
): React.ComponentType<DynamicModulePageProps> {
  if (
    input &&
    typeof input === 'object' &&
    'default' in (input as Record<string, unknown>)
  ) {
    return (input as { default: React.ComponentType<DynamicModulePageProps> })
      .default;
  }
  return input as React.ComponentType<DynamicModulePageProps>;
}

/**
 * Page that first checks for registered modules, then falls back to SDK page.
 */
export default async function Page(props: {
  params: Promise<{ locale: string; slug?: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await props.params;
  const segments = params.slug ?? [];
  const firstSegment = segments[0];

  // Check if first segment matches a registered module
  if (firstSegment) {
    const loader = moduleRegistry.resolve('page', firstSegment);
    if (loader) {
      const searchParams = await props.searchParams;
      const typedLoader = loader as AsyncModuleLoader<
        ModuleExport<DynamicModulePageProps>
      >;

      return React.createElement(getComponentFromModule(await typedLoader()), {
        params: {
          locale: params.locale,
          module: segments,
        },
        searchParams,
        segments: segments.slice(1),
      });
    }
  }

  // Fall back to SDK page handler
  return SDKPage(props);
}

export { generateMetadata };
