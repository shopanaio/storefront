import React from 'react';
import {
  moduleRegistry,
  ModuleType,
  type ShippingProviderModuleApi,
  type PaymentProviderModuleApi,
} from '@src/modules/registry';
import { DynamicRenderer } from './DynamicRenderer';

/**
 * Union type for all provider module APIs
 */
type ProviderModuleApi = ShippingProviderModuleApi | PaymentProviderModuleApi;

/**
 * Props for the ProviderRenderer component
 */
type InputProviderMethod = { code: string; label?: string };

interface ProviderRendererProps {
  /** Type of module to load (shipping or payment) */
  moduleType: ModuleType;
  /** Provider identifier */
  provider: string;
  /** Methods: can be raw with providerId or enriched with controller APIs */
  methods: InputProviderMethod[];
  /** Current locale */
  locale: string;
  /** Optional delivery group id (required for shipping providers) */
  groupId?: string;
  /** Callback when provider form has valid data */
  onValid: (data: unknown) => void;
  /** Callback when provider form has invalid data */
  onInvalid: (errors?: Record<string, string>) => void;
}

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
  methods,
  locale,
  groupId,
  onValid,
  onInvalid,
}: ProviderRendererProps) => {
  const loader = moduleRegistry.resolve<ProviderModuleApi>(
    moduleType,
    provider
  ) as any;

  const componentProps = {
    provider,
    methods,
    locale,
    ...(groupId !== undefined && { groupId }),
    onValid,
    onInvalid,
  };

  return (
    <DynamicRenderer
      loader={loader}
      componentProps={componentProps as any}
    />
  );
};
