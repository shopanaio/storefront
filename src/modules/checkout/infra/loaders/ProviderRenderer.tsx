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
  /** Callback when provider form has valid data */
  onValid: (data: unknown) => void;
  /** Callback when provider form has invalid data */
  onInvalid: (errors?: Record<string, string>) => void;
  /** Selected method */
  selectedMethod: {
    code: string;
    provider: string;
    data: unknown;
  } | null;
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
  onValid,
  onInvalid,
  selectedMethod,
}: ProviderRendererProps) => {
  const loader = moduleRegistry.resolve<ProviderModuleApi>(
    moduleType,
    provider
  );

  const componentProps = {
    provider,
    methods,
    locale,
    onValid,
    onInvalid,
    selectedMethod,
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <DynamicRenderer loader={loader as any} componentProps={componentProps} />
  );
};
