'use client';

import { useEffect } from 'react';
import { PageContextProvider } from './context';
import { SectionRenderer } from './SectionRenderer';
import { PageBuilderStoreProvider } from './store-provider';
import { usePageBuilderState } from './hooks';
import { validateTemplate } from './validation';
import type { PageTemplate } from './types';

export interface PageBuilderProps<TData = any> {
  template: PageTemplate<TData>;
  strictMode?: boolean;
}

export function PageBuilder<TData = any>({
  template,
  strictMode = false,
}: PageBuilderProps<TData>) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && !strictMode) {
      return;
    }

    const errors = validateTemplate(template);
    if (errors.length === 0) {
      return;
    }

    const formatted = errors
      .map(
        (error) =>
          `[${error.severity.toUpperCase()}] Section "${error.sectionType}" (${error.sectionId}): ${error.message}`
      )
      .join('\n');

    if (strictMode) {
      throw new Error(`Template validation failed:\n${formatted}`);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error('Template validation errors:', formatted);
    }
  }, [template, strictMode]);

  return (
    <PageBuilderStoreProvider template={template}>
      <PageContextProvider pageId={template.id}>
        <PageBuilderContent />
      </PageContextProvider>
    </PageBuilderStoreProvider>
  );
}

function PageBuilderContent() {
  const sectionOrder = usePageBuilderState((state) => state.sectionOrder);

  if (sectionOrder.length === 0) {
    return null;
  }

  return (
    <>
      {sectionOrder.map((sectionId) => (
        <SectionRenderer key={sectionId} sectionId={sectionId} />
      ))}
    </>
  );
}
