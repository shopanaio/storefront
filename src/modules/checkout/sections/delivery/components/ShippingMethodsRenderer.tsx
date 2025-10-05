'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { usePrevious } from 'react-use';
import type { ApiCheckoutDeliveryMethod } from '@codegen/schema-client';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';
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
}: ShippingMethodsRendererProps) => {
  const locale = useLocale();
  const sectionController = useSectionController(`delivery:${groupId}`, {
    required: true,
  });
  const invalidateByGroup = useCheckoutStore(
    (s) => s.invalidateShippingProvidersByGroup
  );
  const prevCityRef = usePrevious(addressCity?.Ref ?? null);

  /**
   * Reset section and invalidate providers when city changes.
   * This forces providers to revalidate with new city context.
   */
  useEffect(() => {
    const currentRef = addressCity?.Ref ?? null;
    if (prevCityRef === currentRef) return;
    if (prevCityRef !== undefined) {
      sectionController.reset();
      invalidateByGroup(groupId);
    }
  }, [addressCity?.Ref, prevCityRef, sectionController, invalidateByGroup, groupId]);

  /**
   * Group methods by provider with metadata
   */
  const methodsByProvider = useMemo(() => {
    return methods.reduce<
      Record<
        string,
        Array<{ code: string; label?: string }>
      >
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
  const handleValid = useCallback((data: unknown) => {
    sectionController.publishValid(data as any);
  }, [sectionController]);

  /**
   * Callback when provider form has invalid data.
   * Publishes to section controller following enterprise validation pattern.
   */
  const handleInvalid = useCallback((errors?: Record<string, string>) => {
    sectionController.publishInvalid(errors);
  }, [sectionController]);

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
