'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { usePrevious } from 'react-use';
import type { ApiCheckoutDeliveryMethod } from '@codegen/schema-client';
import type { City } from './city/CitySelect';
import { ModuleType } from '@src/modules/registry';
import { ProviderRenderer } from '@src/modules/checkout/infra/loaders/ProviderRenderer';

/**
 * Props for ShippingMethodsRenderer
 */
interface ShippingMethodsRendererProps {
  /** Unique identifier for the delivery group */
  groupId: string;
  /** Available delivery methods for this group */
  methods: ApiCheckoutDeliveryMethod[];
  /** Currently selected city from address section */
  addressCity: City | null;
  /** Bubble section-level valid up */
  onValid: (data: unknown) => void;
  /** Bubble section-level invalid up */
  onInvalid: (groupId: string, errors?: Record<string, string>) => void;
}

/**
 * Renders shipping methods for a delivery group.
 *
 * Manages section controller registration and handles side effects
 * like resetting state when city changes.
 * Groups methods by provider and delegates rendering to ProviderRenderer.
 */
export const ShippingMethodsRenderer = ({
  groupId,
  methods,
  addressCity,
  onValid,
  onInvalid,
}: ShippingMethodsRendererProps) => {
  const locale = useLocale();

  const prevCityRef = usePrevious(addressCity?.Ref ?? null);

  /**
   * Register/unregister delivery group on mount/unmount
   */
  // no group registration in store; groups are UI concern

  /**
   * Reset group and invalidate providers when city changes.
   * This forces providers to revalidate with new city context.
   */
  useEffect(() => {
    const currentRef = addressCity?.Ref ?? null;
    if (prevCityRef === currentRef) return;
    if (prevCityRef !== undefined) {
      onInvalid(groupId);
    }
  }, [addressCity?.Ref, prevCityRef, onInvalid, groupId]);

  /**
   * Group methods by provider with metadata
   */
  const methodsByProvider = useMemo(() => {
    return methods.reduce<
      Record<string, Array<{ code: string; label?: string }>>
    >((acc, method) => {
      const provider = method.provider.code || 'unknown';
      (acc[provider] ||= []).push({
        code: method.code,
      });
      return acc;
    }, {});
  }, [methods]);

  /**
   * Callback when provider form has valid data.
   * Publishes to section controller following enterprise validation pattern.
   */
  const handleValid = useCallback(
    (data: unknown) => {
      onValid(data);
    },
    [onValid]
  );

  /**
   * Callback when provider form has invalid data.
   * Publishes to section controller following enterprise validation pattern.
   */
  const handleInvalid = useCallback(
    (errors?: Record<string, string>) => {
      onInvalid(errors);
    },
    [onInvalid]
  );

  return (
    <>
      {Object.entries(methodsByProvider).map(([provider, providerMethods]) => (
        <ProviderRenderer
          key={provider}
          moduleType={ModuleType.Shipping}
          provider={provider}
          groupId={groupId}
          methods={providerMethods}
          locale={locale}
          onValid={handleValid}
          onInvalid={handleInvalid}
        />
      ))}
    </>
  );
};

export default ShippingMethodsRenderer;
