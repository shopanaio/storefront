'use client';

import { useEffect, useState, ComponentType, useMemo } from 'react';

interface DynamicRendererProps<TApi, TProps> {
  /** Async loader that returns module API */
  loader: (() => Promise<TApi> | TApi) | undefined;
  /** Extract component from resolved API */
  getComponent: (api: TApi) => ComponentType<TProps>;
  /** Props to pass to the resolved component */
  componentProps: TProps;
}

/**
 * Universal dynamic renderer that resolves and renders a component from an async loader.
 * Reusable for sections, providers, and other dynamic modules.
 */
export function DynamicRenderer<TApi, TProps>({
  loader,
  getComponent,
  componentProps,
}: DynamicRendererProps<TApi, TProps>) {
  const [api, setApi] = useState<TApi | null>(null);

  useEffect(() => {
    if (!loader) {
      setApi(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const mod = await loader();
      if (!cancelled) setApi(mod);
    })();
    return () => {
      cancelled = true;
    };
  }, [loader]);

  // Memoize component to prevent remounting when api and getComponent are stable
  const Component = useMemo(() => {
    if (!api) {
      return null;
    }
    return getComponent(api);
  }, [api, getComponent]);

  if (!Component) return null;

  return <Component {...(componentProps as any)} />;
}
