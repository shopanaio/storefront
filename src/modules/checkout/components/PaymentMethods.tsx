import React, { useMemo } from 'react';
import { Flex } from 'antd';
import { Control, UseFormSetValue } from 'react-hook-form';
import { CheckoutFormValues } from './Checkout';
import { ModuleType } from '@src/modules/registry';
import { ProviderLoader } from './ProviderLoader';
import { useLocale } from 'next-intl';

/** TODO: Use api type when it's available */
interface ApiPaymentMethod {
  code: string;
  provider: string;
}

interface Props {
  methods: ApiPaymentMethod[];
  activePayment: string;
  shippingAsBilling: boolean;
  setValue: UseFormSetValue<CheckoutFormValues>;
  control: Control<CheckoutFormValues>;
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
    <Flex vertical gap={10}>
      {Object.entries(byProvider).map(([provider, providerMethods]) => (
        <ProviderLoader
          key={provider}
          moduleType={ModuleType.Payment}
          provider={provider}
          methods={providerMethods}
          locale={locale}
        />
      ))}
    </Flex>
  );
};
