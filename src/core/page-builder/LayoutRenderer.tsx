'use client';

import { useMemo, type ReactNode } from 'react';
import { pageBuilderRegistry } from './registry';
import { usePageBuilderState } from './hooks';

export interface LayoutRendererProps {
  children: ReactNode;
}

export function LayoutRenderer({ children }: LayoutRendererProps) {
  const layout = usePageBuilderState((state) => state.layout);

  // Load component synchronously from registry
  const Component = useMemo(() => {
    if (!layout) return null;

    // Try to get from cache first
    let component = pageBuilderRegistry.getLayoutComponent(layout.type);

    // If not in cache, load synchronously
    if (!component) {
      const record = pageBuilderRegistry.getLayout(layout.type);
      if (record) {
        const result = record.loader();
        // For synchronous loaders, result is the module directly
        const module = result instanceof Promise ? null : result;
        if (module) {
          component = module.default ?? null;
          // Save to cache
          if (component) {
            pageBuilderRegistry.setLayoutComponent(layout.type, component);
          }
        }
      }
    }

    return component;
  }, [layout?.type]);

  if (!layout) {
    // If no layout is defined, render children directly
    return <>{children}</>;
  }

  if (!Component) {
    // Fallback to rendering children without layout
    return <>{children}</>;
  }

  return (
    <Component
      id={layout.id}
      settings={layout.settings}
      sections={layout.sections}
    >
      {children}
    </Component>
  );
}
