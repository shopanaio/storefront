import React from 'react';

import { DynamicRenderer } from './DynamicRenderer';
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
  ...componentProps
}: ProviderProps) => {
  const loader = moduleRegistry.resolve<ProviderModuleApi>(
    moduleType,
    provider
  );

  return (
    <DynamicRenderer
      loader={loader}
      componentProps={{ ...componentProps, provider }}
    />
  );
};
