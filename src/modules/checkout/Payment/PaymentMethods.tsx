import React, { useEffect, useMemo, useState } from "react";
import { Flex } from "antd";
import { Control, UseFormSetValue } from "react-hook-form";
import { CheckoutFormValues } from "../Checkout";
import { moduleRegistry, ModuleType, type PaymentProviderModuleApi } from "@src/modules/registry";

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

const ProviderRenderer: React.FC<{ provider: string; methods: ApiPaymentMethod[] }> = ({ provider, methods }) => {
  const [api, setApi] = useState<PaymentProviderModuleApi | null>(null);
  const providerMethods = useMemo(() => methods.map((m) => ({ code: m.code })), [methods]);
  useEffect(() => {
    const loader = moduleRegistry.resolve<PaymentProviderModuleApi>(ModuleType.Payment, provider);
    if (!loader) {
      setApi(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const mod = (await loader()) as PaymentProviderModuleApi;
      if (!cancelled) setApi(mod);
    })();
    return () => {
      cancelled = true;
    };
  }, [provider]);
  if (!api) return null;
  const { Component } = api;
  return <Component provider={provider} methods={providerMethods} locale={"uk"} />;
};

export const PaymentMethods = ({ methods }: Props) => {
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
        <ProviderRenderer key={provider} provider={provider} methods={providerMethods} />
      ))}
    </Flex>
  );
};
