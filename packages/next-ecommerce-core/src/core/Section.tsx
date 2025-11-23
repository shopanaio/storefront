'use client';

import type { SectionProps, SectionComponent } from './types';
import { SectionErrorBoundary } from './ErrorBoundary';

interface SectionRendererProps<TSettings = any, TData = any>
  extends SectionProps<TSettings, TData> {
  component: SectionComponent<TSettings, TData>;
}

export function Section<TSettings = any, TData = any>({
  component,
  ...config
}: SectionRendererProps<TSettings, TData>) {
  const Component = component;

  return (
    <SectionErrorBoundary sectionId={config.id}>
      <Component {...config} />
    </SectionErrorBoundary>
  );
}

