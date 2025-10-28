import React from 'react';
import { redirect } from 'next/navigation';
import '@src/modules';
import {
  moduleRegistry,
  type DynamicModulePageProps,
  type ModuleExport,
  type AsyncModuleLoader,
} from '@src/modules/registry';

/**
 * Server page that resolves modules by slug using the global Module Registry.
 * The first segment of `[...module]` is treated as module slug; the rest are passed to the module.
 */
export default async function Page(
  props: {
    params: Promise<{ locale: string; module?: string[] }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const segments = params.module ?? [];
  const slug = segments[0];

  if (!slug) {
    return redirect('/');
  }

  const loader = moduleRegistry.resolve('page', slug);
  if (!loader) {
    return redirect('/');
  }

  const typedLoader = loader as AsyncModuleLoader<
    ModuleExport<DynamicModulePageProps>
  >;
  const mod = await typedLoader();

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

  const Component = getComponentFromModule(
    mod as ModuleExport<DynamicModulePageProps>
  );

  return React.createElement(Component, {
    params,
    searchParams,
    segments: segments.slice(1),
  });
}
