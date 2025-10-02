import React, { useEffect, useMemo, useState } from "react";
import { ApiCheckoutDeliveryMethod } from "@codegen/schema-client";
import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { CheckoutFormValues } from "../Checkout";
import {
  moduleRegistry,
  ModuleType,
  type ShippingProviderModuleApi,
} from "@src/modules/registry";
import { useLocale } from "next-intl";

interface Props {
  methods: ApiCheckoutDeliveryMethod[];
  activeShippingKey: string;
  setValue: UseFormSetValue<CheckoutFormValues>;
  control: Control<CheckoutFormValues>;
  watch: UseFormWatch<CheckoutFormValues>;
}

const ProviderRenderer: React.FC<{
  provider: string;
  methods: ApiCheckoutDeliveryMethod[];
  locale: string;
}> = ({ provider, methods, locale }) => {
  const [api, setApi] = useState<ShippingProviderModuleApi | null>(null);

  useEffect(() => {
    const loader = moduleRegistry.resolve<ShippingProviderModuleApi>(
      ModuleType.Shipping,
      provider
    );
    if (!loader) {
      setApi(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const mod = (await loader()) as ShippingProviderModuleApi;
      if (!cancelled) setApi(mod);
    })();
    return () => {
      cancelled = true;
    };
  }, [provider]);

  const providerMethods = useMemo(
    () => methods.map((m) => ({ code: m.code })),
    [methods]
  );
  if (!api) return null;
  const { Component } = api;

  return (
    <Component provider={provider} methods={providerMethods} locale={locale} />
  );
};

export const ShippingMethods = ({ methods }: Props) => {
  const locale = useLocale();
  const byProvider = useMemo(
    () =>
      methods.reduce<Record<string, ApiCheckoutDeliveryMethod[]>>((acc, m) => {
        const key = m.provider.code || "unknown";
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
          provider={provider}
          methods={providerMethods}
          locale={locale}
        />
      ))}
    </>
  );
};
