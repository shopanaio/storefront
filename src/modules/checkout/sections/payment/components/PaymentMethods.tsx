import React, { useMemo } from 'react';
import { ModuleType } from '@src/modules/registry';
import { ProviderRenderer } from '@src/modules/checkout/infra/loaders/ProviderRenderer';
import { useLocale } from 'next-intl';

/** TODO: Use api type when it's available */
interface ApiPaymentMethod {
  code: string;
  provider: string;
}

interface Props {
  methods: ApiPaymentMethod[];
}

export const PaymentMethods = ({ methods }: Props) => {
  const locale = useLocale();
  const byProvider = useMemo(
    () =>
      methods.reduce<Record<string, ApiPaymentMethod[]>>((acc, m) => {
        (acc[m.provider] ||= []).push(m);
        return acc;
      }, {}),
    [methods]
  );
  return (
    <>
      {Object.entries(byProvider).map(([provider, providerMethods]) => (
        <ProviderRenderer
          key={provider}
          moduleType={ModuleType.Payment}
          provider={provider}
          methods={providerMethods}
          locale={locale}
        />
      ))}
    </>
  );
};
