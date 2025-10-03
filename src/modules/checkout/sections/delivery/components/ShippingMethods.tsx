import React, { useMemo } from 'react';
import { ApiCheckoutDeliveryMethod } from '@codegen/schema-client';
import { ModuleType } from '@src/modules/registry';
import { useLocale } from 'next-intl';
import { ProviderRenderer } from '@src/modules/checkout/infra/loaders/ProviderRenderer';

interface Props {
  methods: ApiCheckoutDeliveryMethod[];
}

export const ShippingMethods = ({ methods }: Props) => {
  const locale = useLocale();
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
        />
      ))}
    </>
  );
};
