import React, { useEffect, useState } from "react";
import {
  moduleRegistry,
  ModuleType,
  type ShippingProviderModuleApi,
  type PaymentProviderModuleApi,
  type ProviderMethod,
} from "@src/modules/registry";

/**
 * Union type for all provider module APIs
 */
type ProviderModuleApi = ShippingProviderModuleApi | PaymentProviderModuleApi;

/**
 * Props for the ProviderLoader component
 */
interface ProviderLoaderProps<TMethod extends { code: string }> {
  /** Type of module to load (shipping or payment) */
  moduleType: ModuleType;
  /** Provider identifier */
  provider: string;
  /** Methods provided by this provider */
  methods: TMethod[];
  /** Current locale */
  locale: string;
}

/**
 * Generic component for loading and rendering provider modules.
 * Handles async module loading and provides a consistent interface
 * for both shipping and payment providers.
 *
 * @template TMethod - Type of method objects (must have a code property)
 */
export const ProviderLoader = <TMethod extends { code: string }>({
  moduleType,
  provider,
  methods,
  locale,
}: ProviderLoaderProps<TMethod>) => {
  const [api, setApi] = useState<ProviderModuleApi | null>(null);

  useEffect(() => {
    const loader = moduleRegistry.resolve<ProviderModuleApi>(
      moduleType,
      provider
    );
    if (!loader) {
      setApi(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const mod = (await loader()) as ProviderModuleApi;
      if (!cancelled) setApi(mod);
    })();
    return () => {
      cancelled = true;
    };
  }, [moduleType, provider]);

  if (!api) return null;

  const { Component } = api;

  // Transform methods to ProviderMethod format
  const providerMethods: ProviderMethod[] = methods.map((m) => ({
    code: m.code
  }));

  return (
    <Component provider={provider} methods={providerMethods} locale={locale} />
  );
};
