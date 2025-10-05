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
  /** Section controller for validation and state */
  sectionController: {
    publishValid: (data: unknown) => void;
    publishInvalid: (errors?: Record<string, string>) => void;
    reset: () => void;
    busy: boolean;
  };
}

/**
 * Generic component for loading and rendering provider modules.
 * Handles async module loading and provides a consistent interface
 * for both shipping and payment providers.
 *
 * Expects methods to already include controller APIs.
 */
export const ProviderRenderer = ({
  moduleType,
  provider,
  methods,
  locale,
  groupId,
  sectionController,
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
    sectionController,
  };

  return (
    <DynamicRenderer
      loader={loader}
      componentProps={componentProps as any}
    />
  );
};
