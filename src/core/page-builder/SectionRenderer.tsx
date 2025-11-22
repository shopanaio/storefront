'use client';

import { use } from 'react';
import { SectionContextProvider } from './context';
import { pageBuilderRegistry } from './registry';
import { usePageBuilderState } from './hooks';

export interface SectionRendererProps {
  sectionId: string;
}

export function SectionRenderer({ sectionId }: SectionRendererProps) {
  const section = usePageBuilderState((state) => state.sections[sectionId]);

  if (!section) {
    console.error(`Section with id "${sectionId}" not found in store`);
    return null;
  }

  const Component = use(pageBuilderRegistry.loadSection(section.type));

  if (!Component) {
    console.error(`Section type "${section.type}" not found in registry`);
    return null;
  }

  return (
    <SectionContextProvider sectionId={section.id}>
      <Component id={section.id} settings={section.settings} blocks={section.blocks} />
    </SectionContextProvider>
  );
}
