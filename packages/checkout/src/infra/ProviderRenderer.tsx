import React, { useEffect, useMemo, useState } from 'react';
import { Flex } from 'antd';

import { moduleRegistry } from '@shopana/storefront-sdk/registry';
import {
  ProviderMethod,
  ProviderModuleApi,
  ProviderModuleType,
  ProviderProps,
} from '#checkout/vendors/types';
import { CheckoutMethodPanel } from '#checkout/components/common/CheckoutMethodPanel';

const GenericDeliveryProvider = ({
  availableMethods,
  selectedMethod,
  onSelectMethod,
}: Pick<
  ProviderProps,
  'availableMethods' | 'selectedMethod' | 'onSelectMethod'
>) => (
  <Flex vertical gap={12}>
    {availableMethods.map((method: ProviderMethod) => (
      <CheckoutMethodPanel
        key={method.handle}
        title={method.title || method.code}
        description={method.description ?? null}
        isActive={selectedMethod?.handle === method.handle}
        onActive={() => onSelectMethod?.(method)}
        component={null}
      />
    ))}
  </Flex>
);

/**
 * Generic component for loading and rendering provider modules.
 * Handles async module loading and provides a consistent interface
 * for both shipping and payment providers.
 *
 * Provides explicit validation callback interface following enterprise patterns.
 */
export const ProviderRenderer = ({
  moduleType,
  provider,
  onSelectMethod,
  onUpdateMethodData,
  ...componentProps
}: ProviderProps) => {
  const [api, setApi] = useState<ProviderModuleApi | null>(null);
  const loader = useMemo(
    () => moduleRegistry.resolve<ProviderModuleApi>(moduleType, provider),
    [moduleType, provider]
  );

  useEffect(() => {
    if (!loader) {
      setApi(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      if (!cancelled) {
        const api = await loader();
        setApi(api);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [loader]);

  const activeApi =
    api?.provider === provider && api.moduleType === moduleType ? api : null;
  const { Component, config } = activeApi || {};

  if (!Component || !config) {
    if (!loader && moduleType === ProviderModuleType.Delivery) {
      return (
        <GenericDeliveryProvider
          availableMethods={componentProps.availableMethods}
          selectedMethod={componentProps.selectedMethod}
          onSelectMethod={onSelectMethod}
        />
      );
    }

    return null;
  }

  return (
    <Component
      {...componentProps}
      provider={provider}
      config={config}
      onSelectMethod={onSelectMethod}
      onUpdateMethodData={onUpdateMethodData}
      deliveryAddress={componentProps.deliveryAddress}
    />
  );
};
