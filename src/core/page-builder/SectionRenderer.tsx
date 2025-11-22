'use client';

import { useMemo } from 'react';
import { SectionContextProvider } from './context';
import { pageBuilderRegistry } from './registry';
import { usePageBuilderState } from './hooks';

export interface SectionRendererProps {
  sectionId: string;
  isLayoutSection?: boolean;
}

export function SectionRenderer({ sectionId, isLayoutSection = false }: SectionRendererProps) {
  const section = usePageBuilderState((state) =>
    isLayoutSection ? state.layoutSections[sectionId] : state.sections[sectionId]
  );

  // Load component synchronously from registry
  const Component = useMemo(() => {
    if (!section) return null;

    // Try to get from cache first
    let component = pageBuilderRegistry.getSectionComponent(section.type);

    // If not in cache, load synchronously
    if (!component) {
      const record = pageBuilderRegistry.getSection(section.type);
      if (record) {
        const result = record.loader();
        // For synchronous loaders, result is the module directly
        const module = result instanceof Promise ? null : result;
        if (module) {
          component = module.default ?? null;
          // Save to cache
          if (component) {
            pageBuilderRegistry.setSectionComponent(section.type, component);
          }
        }
      }
    }

    return component;
  }, [section?.type]);

  if (!section) {
    console.error(`Section with id "${sectionId}" not found in store`);
    return null;
  }

  if (!Component) {
    console.error(`Section type "${section.type}" not found or not loaded`);
    return null;
  }

  return (
    <SectionContextProvider sectionId={section.id}>
      <Component id={section.id} settings={section.settings} blocks={section.blocks} />
    </SectionContextProvider>
  );
}
