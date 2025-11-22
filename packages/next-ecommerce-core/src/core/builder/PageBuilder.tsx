import type { ComponentType, ReactNode } from 'react';
import { PageDataProvider } from '../context/PageDataContext';
import { SectionErrorBoundary } from './SectionErrorBoundary';
import type { PageBuilderProps, SectionInstance, SectionProps } from '../types';

function renderSection<TSettings, TData>(
  section: SectionInstance<TSettings, TData>,
  data: TData,
  fallback?: ReactNode
) {
  const Component = section.component as ComponentType<SectionProps<TSettings, TData>>;

  return (
    <SectionErrorBoundary key={section.id} fallback={fallback}>
      <Component id={section.id} settings={section.settings} blocks={section.blocks} data={data} />
    </SectionErrorBoundary>
  );
}

export function PageBuilder<TData>({ template, data, pageType, fallback }: PageBuilderProps<TData>) {
  return (
    <PageDataProvider value={{ pageType, data }}>
      <main data-page-type={pageType} data-template-name={template.name}>
        {template.sections.map((section) => renderSection(section, data, fallback))}
      </main>
    </PageDataProvider>
  );
}
