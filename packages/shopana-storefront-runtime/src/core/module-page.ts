import type { ComponentType } from 'react';
import type {
  DynamicModulePageProps,
  ModuleExport,
} from '@shopana/storefront-sdk/registry';
import type { RuntimeMetadata } from './metadata';

/** The page component of a module: its default export or the export itself. */
export function getComponentFromModule(
  input: ModuleExport<DynamicModulePageProps>
): ComponentType<DynamicModulePageProps> {
  if (
    input &&
    typeof input === 'object' &&
    'default' in (input as Record<string, unknown>)
  ) {
    return (input as { default: ComponentType<DynamicModulePageProps> })
      .default;
  }
  return input as ComponentType<DynamicModulePageProps>;
}

/** A module page module may export `generateMetadata(props)` next to its default component. */
export type ModuleMetadataGenerator = (
  props: DynamicModulePageProps
) => Promise<RuntimeMetadata> | RuntimeMetadata;

export function getModuleMetadataGenerator(
  input: unknown
): ModuleMetadataGenerator | null {
  if (input && typeof input === 'object' && 'generateMetadata' in input) {
    const generate = (input as { generateMetadata: unknown }).generateMetadata;
    if (typeof generate === 'function') {
      return generate as ModuleMetadataGenerator;
    }
  }
  return null;
}

/** The title of a module page without its own metadata, from its slug. */
export function buildModuleMetadata(slug: string): RuntimeMetadata {
  const title = slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return { title: title || 'Page' };
}
