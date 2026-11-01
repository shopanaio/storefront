'use client';

import { lazy, Suspense, type ComponentType } from 'react';
import { useHydrated } from '@shopana/storefront-sdk/core/Hydrated';
import type {
  Dynamic,
  DynamicLoader,
  DynamicOptions,
} from '../core/facade-types';

/**
 * `next/dynamic` over `React.lazy`: the component loads on first render, in its own chunk.
 * With `ssr: false` the server and hydration render `loading`, and the component loads in the
 * browser only.
 */
function dynamic<TProps = object>(
  loader: DynamicLoader<TProps>,
  options: DynamicOptions = {}
): ComponentType<TProps> {
  const Lazy = lazy(async () => {
    const loaded = await loader();
    return {
      default: (typeof loaded === 'object' &&
      loaded !== null &&
      'default' in loaded
        ? loaded.default
        : loaded) as ComponentType<object>,
    };
  });
  const { loading, ssr = true } = options;
  // A component, so `loading` runs only when the fallback shows.
  const Loading = () => <>{loading?.()}</>;

  function DynamicComponent(props: TProps) {
    const hydrated = useHydrated();
    const fallback = <Loading />;
    if (!ssr && !hydrated) return fallback;
    return (
      <Suspense fallback={fallback}>
        <Lazy {...(props as object)} />
      </Suspense>
    );
  }

  return DynamicComponent;
}

export default dynamic satisfies Dynamic;
