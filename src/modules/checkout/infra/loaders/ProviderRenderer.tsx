import React from 'react';
import {
  moduleRegistry,
  ModuleType,
  type ShippingProviderModuleApi,
  type PaymentProviderModuleApi,
  type ProviderMethod,
} from '@src/modules/registry';
import { DynamicRenderer } from './DynamicRenderer';

/**
 * Union type for all provider module APIs
 */
type ProviderModuleApi = ShippingProviderModuleApi | PaymentProviderModuleApi;

/**
 * Props for the ProviderRenderer component
 */
interface ProviderRendererProps<TMethod extends { code: string }> {
  /** Type of module to load (shipping or payment) */
  moduleType: ModuleType;
  /** Provider identifier */
  provider: string;
  /** Methods provided by this provider */
  methods: TMethod[];
  /** Current locale */
  locale: string;
  /** Optional delivery group id (required for shipping providers) */
  groupId?: string;
}

/**
 * Generic component for loading and rendering provider modules.
 * Handles async module loading and provides a consistent interface
 * for both shipping and payment providers.
 *
 * @template TMethod - Type of method objects (must have a code property)
 */
export const ProviderRenderer = <TMethod extends { code: string }>({
  moduleType,
  provider,
  methods,
  locale,
  groupId,
}: ProviderRendererProps<TMethod>) => {
  const loader = moduleRegistry.resolve<ProviderModuleApi>(moduleType, provider);
  const activeOnlyMethods = methods; // placeholder for future filtering if needed

  return (
    <DynamicRenderer
      loader={loader}
      getComponent={(api: ProviderModuleApi) => api.Component}
      componentProps={{
        provider,
        methods: activeOnlyMethods.map((m) => ({ code: m.code } as ProviderMethod)),
        locale,
        groupId,
      }}
    />
  );
};
