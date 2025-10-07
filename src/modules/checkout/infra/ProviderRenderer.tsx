import React, { useEffect, useState } from 'react';

import { moduleRegistry } from '@src/modules/registry';
import {
  ProviderModuleApi,
  ProviderProps,
} from '@src/modules/checkout/vendors/types';

/**
 * Generic component for loading and rendering provider modules.
 * Handles async module loading and provides a consistent interface
 * for both shipping and payment providers.
 *
 * Provides explicit validation callback interface following enterprise patterns.
 */
export const ProviderRenderer = ({
  moduleType,
  provider,
  onSelectMethod,
  onUpdateMethodData,
  ...componentProps
}: ProviderProps) => {
  const [api, setApi] = useState<ProviderModuleApi | null>(null);

  useEffect(() => {
    const loader = moduleRegistry.resolve<ProviderModuleApi>(
      moduleType,
      provider
    );

    if (!loader) {
      setApi(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      if (!cancelled) {
        const api = await loader();
        setApi(api);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [provider, moduleType]);

  const { Component, config } = api || {};

  if (!Component || !config) {
    return null;
  }

  return (
    <Component
      {...componentProps}
      provider={provider}
      config={config}
      onSelectMethod={onSelectMethod}
      onUpdateMethodData={onUpdateMethodData}
    />
  );
};
