import { useEffect, useMemo, useState } from 'react';
import { moduleRegistry } from '@shopana/storefront-sdk/registry';
import type { ProviderModuleType } from '#checkout/vendors/types';

/**
 * Loads the module registered under `type`/`slug`. `found` is false when nothing is
 * registered; `api` stays null until the loader resolves.
 */
export function useRegisteredModule<T>(
  type: ProviderModuleType,
  slug: string | null
) {
  const loader = useMemo(
    () => (slug ? moduleRegistry.resolve<T>(type, slug) : null),
    [type, slug]
  );
  const [loaded, setLoaded] = useState<{ slug: string; api: T } | null>(null);

  useEffect(() => {
    if (!loader || !slug) {
      return;
    }
    let cancelled = false;
    Promise.resolve(loader()).then((api: T) => {
      if (!cancelled) {
        setLoaded({ slug, api });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loader, slug]);

  return {
    found: Boolean(loader),
    api: loaded && loaded.slug === slug ? loaded.api : null,
  };
}
