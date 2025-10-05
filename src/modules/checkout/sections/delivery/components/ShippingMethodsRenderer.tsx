'use client';

import { useEffect, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { usePrevious } from 'react-use';
import type { ApiCheckoutDeliveryMethod } from '@codegen/schema-client';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';
import { useMethodSelectionShipping } from '@src/modules/checkout/state/hooks/useMethodSelection';
import type { City } from './city/CitySelect';
import { ProviderMethodsRenderer } from './ProviderMethodsRenderer';

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
 * Groups methods by provider and delegates rendering to ProviderMethodsRenderer.
 */
export const ShippingMethodsRenderer = ({
  groupId,
  methods,
  addressCity,
}: ShippingMethodsRendererProps) => {
  const locale = useLocale();
  const { reset } = useSectionController(`delivery:${groupId}`, {
    required: true,
  });
  const invalidateByGroup = useCheckoutStore((s) => s.invalidateShippingProvidersByGroup);
  const prevCityRef = usePrevious(addressCity?.Ref ?? null);
  const { selected } = useMethodSelectionShipping(groupId);

  /**
   * Reset section and invalidate providers when city changes.
   * This forces providers to revalidate with new city context.
   */
  useEffect(() => {
    const currentRef = addressCity?.Ref ?? null;
    if (prevCityRef === currentRef) return;
    if (prevCityRef !== undefined) {
      reset();
      invalidateByGroup(groupId);
    }
  }, [addressCity?.Ref, prevCityRef, reset, invalidateByGroup, groupId]);

  /**
   * Group methods by provider with metadata
   */
  const methodsByProvider = useMemo(() => {
    return methods.reduce<
      Record<string, Array<{ code: string; label?: string; providerId: string }>>
    >((acc, method) => {
      const provider = method.provider.code || 'unknown';
      const providerId = `delivery:${provider}@${groupId}` as const;
      (acc[provider] ||= []).push({
        code: method.code,
        label: method.title || undefined,
        providerId,
      });
      return acc;
    }, {});
  }, [methods, groupId]);

  return (
    <>
      {Object.entries(methodsByProvider).map(([provider, providerMethods]) => (
        <ProviderMethodsRenderer
          key={provider}
          provider={provider}
          groupId={groupId}
          methods={providerMethods}
          selectedMethodCode={selected?.code}
          locale={locale}
        />
      ))}
    </>
  );
};

export default ShippingMethodsRenderer;
