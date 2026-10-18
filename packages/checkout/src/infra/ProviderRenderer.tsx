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
import { warnMissingPaymentModule } from '#checkout/infra/warnMissingPaymentModule';
import { GenericCustomerInputForm } from '#checkout/infra/GenericCustomerInputForm';
import { contractNeedsForm } from '#checkout/infra/customerInputForm';

const GenericDeliveryProvider = ({
  availableMethods,
  selectedMethod,
  onSelectMethod,
  onUpdateMethodData,
  deliveryAddress,
}: Pick<
  ProviderProps,
  | 'availableMethods'
  | 'selectedMethod'
  | 'onSelectMethod'
  | 'onUpdateMethodData'
  | 'deliveryAddress'
>) => (
  <Flex vertical gap={12}>
    {availableMethods.map((method: ProviderMethod) => (
      <CheckoutMethodPanel
        key={method.handle}
        title={method.title || method.code}
        description={method.description ?? null}
        isActive={selectedMethod?.handle === method.handle}
        onActive={() => onSelectMethod?.(method)}
        component={
          contractNeedsForm(method.customerInputContract)
            ? GenericCustomerInputForm
            : null
        }
        componentProps={{
          contract: method.customerInputContract,
          data: method.data,
          resetKey: JSON.stringify(deliveryAddress ?? null),
          onSubmit: (data: unknown) =>
            onUpdateMethodData?.(method.handle, data),
        }}
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
  const { availableMethods } = componentProps;

  /**
   * A payment method is shown only when its provider module declares it (R3).
   * Methods without a UI module stay hidden and are reported in dev.
   */
  const renderableMethods = useMemo(
    () =>
      moduleType === ProviderModuleType.Payment && config
        ? availableMethods.filter((method) =>
            config.methods.some((m) => m.code === method.code)
          )
        : availableMethods,
    [moduleType, config, availableMethods]
  );

  useEffect(() => {
    if (moduleType !== ProviderModuleType.Payment) {
      return;
    }

    if (!loader) {
      availableMethods.forEach((method) =>
        warnMissingPaymentModule(provider, method.code, 'provider')
      );
      return;
    }

    if (config) {
      availableMethods
        .filter((method) => !renderableMethods.includes(method))
        .forEach((method) =>
          warnMissingPaymentModule(provider, method.code, 'method')
        );
    }
  }, [moduleType, loader, config, availableMethods, renderableMethods, provider]);

  if (!Component || !config) {
    if (!loader && moduleType === ProviderModuleType.Delivery) {
      return (
        <GenericDeliveryProvider
          availableMethods={availableMethods}
          selectedMethod={componentProps.selectedMethod}
          onSelectMethod={onSelectMethod}
          onUpdateMethodData={onUpdateMethodData}
          deliveryAddress={componentProps.deliveryAddress}
        />
      );
    }

    return null;
  }

  return (
    <Component
      {...componentProps}
      availableMethods={renderableMethods}
      provider={provider}
      config={config}
      onSelectMethod={onSelectMethod}
      onUpdateMethodData={onUpdateMethodData}
      deliveryAddress={componentProps.deliveryAddress}
    />
  );
};
