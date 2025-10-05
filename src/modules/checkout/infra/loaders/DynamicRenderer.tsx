'use client';

import { useEffect, useState, ComponentType } from 'react';

interface ModuleApi<TProps> {
  Component: ComponentType<TProps>;
}

interface DynamicRendererProps<TProps> {
  /** Async loader that returns a module API with Component */
  loader: (() => Promise<ModuleApi<TProps>> | ModuleApi<TProps>) | undefined;
  /** Props to pass to the resolved component */
  componentProps: TProps;
}

/**
 * Universal dynamic renderer that resolves and renders a component from an async loader.
 * Reusable for sections, providers, and other dynamic modules.
 */
export function DynamicRenderer<TProps>({
  loader,
  componentProps,
}: DynamicRendererProps<TProps>) {
  const [Component, setComponent] = useState<ComponentType<TProps> | null>(null);

  useEffect(() => {
    if (!loader) {
      setComponent(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const api = await loader();
      if (!cancelled) setComponent(() => api.Component);
    })();
    return () => {
      cancelled = true;
    };
  }, [loader]);

  if (!Component) return null;

  return <Component {...(componentProps as any)} />;
}
