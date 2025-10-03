import React, { useEffect, useMemo, useRef } from 'react';
import { ApiCheckoutDeliveryMethod } from '@codegen/schema-client';
import { ModuleType } from '@src/modules/registry';
import { useLocale } from 'next-intl';
import { ProviderRenderer } from '@src/modules/checkout/infra/loaders/ProviderRenderer';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { useMethodSelectionShipping } from '@src/modules/checkout/state/hooks/useMethodSelection';
import type { City } from './city/CitySelect';

interface Props {
  groupId: string;
  methods: ApiCheckoutDeliveryMethod[];
  addressCity: City | null;
}

export const ShippingMethods = ({ groupId, methods, addressCity }: Props) => {
  const locale = useLocale();
  const { reset } = useSectionController(`shipping:${groupId}` as any, { required: true });
  const { selected, select } = useMethodSelectionShipping(groupId);
  const prevCityRef = useRef<string | null>(null);

  useEffect(() => {
    const currentRef = addressCity?.Ref ?? null;
    if (prevCityRef.current === currentRef) return;
    prevCityRef.current = currentRef;
    reset();
    if (selected?.code) {
      select(null);
    }
  }, [addressCity?.Ref, reset, select, selected?.code]);
  const byProvider = useMemo(
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
      {Object.entries(byProvider).map(([provider, providerMethods]) => (
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
