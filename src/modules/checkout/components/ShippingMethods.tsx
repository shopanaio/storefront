import React, { useMemo } from 'react';
import { ApiCheckoutDeliveryMethod } from '@codegen/schema-client';
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { CheckoutFormValues } from './Checkout';
import { ModuleType } from '@src/modules/registry';
import { useLocale } from 'next-intl';
import { ProviderLoader } from './ProviderLoader';

interface Props {
  methods: ApiCheckoutDeliveryMethod[];
  activeShippingKey: string;
  setValue: UseFormSetValue<CheckoutFormValues>;
  control: Control<CheckoutFormValues>;
  watch: UseFormWatch<CheckoutFormValues>;
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
        <ProviderLoader
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
