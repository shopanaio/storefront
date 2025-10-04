import React, { useEffect, useMemo } from 'react';
import { ApiCheckoutDeliveryMethod } from '@codegen/schema-client';
import { ModuleType } from '@src/modules/registry';
import { useLocale } from 'next-intl';
import { usePrevious } from 'react-use';
import { ProviderRenderer } from '@src/modules/checkout/infra/loaders/ProviderRenderer';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import type { City } from './city/CitySelect';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';

interface Props {
  groupId: string;
  methods: ApiCheckoutDeliveryMethod[];
  addressCity: City | null;
}

export const ShippingMethods = ({ groupId, methods, addressCity }: Props) => {
  const locale = useLocale();
  const { reset } = useSectionController(`shipping:${groupId}`, {
    required: true,
  });
  const invalidateByGroup = useCheckoutStore((s) => s.invalidateShippingProvidersByGroup);
  const prevCityRef = usePrevious(addressCity?.Ref ?? null);

  useEffect(() => {
    const currentRef = addressCity?.Ref ?? null;
    if (prevCityRef === currentRef) return;
    if (prevCityRef !== undefined) {
      // Reset shipping section validation state to force providers to revalidate
      // but keep the selected method - only internal provider forms should reset
      reset();
      // Invalidate provider states for this group to ensure re-validation on city change
      invalidateByGroup(groupId);
    }
  }, [addressCity?.Ref, prevCityRef, reset, invalidateByGroup, groupId]);

  const methodsByProvider = useMemo(
    () =>
      methods.reduce<Record<string, ApiCheckoutDeliveryMethod[]>>((acc, m) => {
        const key = m.provider.code || 'unknown';
        (acc[key] ||= []).push(m);
        return acc;
      }, {}),
    [methods]
  );

  return (
    <>
      {Object.entries(methodsByProvider).map(([provider, providerMethods]) => (
        <ProviderRenderer
          key={provider}
          moduleType={ModuleType.Shipping}
          provider={provider}
          methods={providerMethods}
          locale={locale}
          groupId={groupId}
        />
      ))}
    </>
  );
};
