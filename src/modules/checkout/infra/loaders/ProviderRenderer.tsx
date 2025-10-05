import React from 'react';
import { useProviderController } from '@src/modules/checkout/state/hooks/useProviderController';
import type { ProviderId } from '@src/modules/checkout/state/checkoutBus';
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
type InputProviderMethod =
  | ProviderMethod
  | { code: string; label?: string; providerId: string };

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
}: ProviderRendererProps) => {
  // Normalize methods to include controller APIs. This centralizes hook usage
  // and keeps callers free from rule-of-hooks concerns.
  const methodsWithControllers: ProviderMethod[] = methods.map((method) => {
    if ((method as ProviderMethod).controller) {
      return method as ProviderMethod;
    }

    const raw = method as { code: string; label?: string; providerId: string };
    const controller = useProviderController(
      raw.providerId as ProviderId,
      moduleType === ModuleType.Shipping ? 'delivery' : 'payment'
    );

    return {
      code: raw.code,
      label: raw.label,
      controller: {
        publishValid: controller.publishValid,
        publishInvalid: controller.publishInvalid,
        reset: controller.reset,
        active: controller.active,
        busy: controller.busy,
      },
    };
  });

  const loader = moduleRegistry.resolve<ProviderModuleApi>(
    moduleType,
    provider
  );

  return (
    <DynamicRenderer
      loader={loader}
      componentProps={{
        provider,
        methods: methodsWithControllers,
        locale,
        groupId,
      }}
    />
  );
};
