import React, { useEffect, useMemo } from 'react';
import { Flex } from 'antd';

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
import { addressScope } from '#checkout/sections/delivery/customerInputStorage';
import { useRegisteredModule } from '#checkout/infra/useRegisteredModule';
import { ScopedIntlProvider } from '#checkout/ui/ScopedIntlProvider';

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
          resetKey: addressScope(deliveryAddress ?? null),
          onSubmit: (data: unknown) =>
            onUpdateMethodData?.(method.handle, data),
        }}
      />
    ))}
  </Flex>
);

/**
 * Generic component for loading and rendering provider modules: it suspends until the module of
 * the provider and its messages are loaded (the `LoadingBoundary` around it shows its skeleton
 * meanwhile) and gives shipping and payment providers one interface. A module that fails to
 * load throws a `LoadError`, shown by that boundary with a "Retry".
 */
export const ProviderRenderer = ({
  moduleType,
  provider,
  onSelectMethod,
  onUpdateMethodData,
  ...componentProps
}: ProviderProps) => {
  const { found, api } = useRegisteredModule<ProviderModuleApi>(
    moduleType,
    provider
  );

  const activeApi =
    api?.provider === provider && api.moduleType === moduleType ? api : null;
  if (api && !activeApi && process.env.NODE_ENV !== 'production') {
    console.error(
      `The ${moduleType} module registered as "${provider}" declares "${api.moduleType}" / "${api.provider}".`
    );
  }
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

    if (!found) {
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
  }, [moduleType, found, config, availableMethods, renderableMethods, provider]);

  if (!Component || !config) {
    if (!found && moduleType === ProviderModuleType.Delivery) {
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

  const view = (
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
  const messages = activeApi?.messages;
  return messages ? (
    <ScopedIntlProvider scope={messages.scope} load={messages.load}>
      {view}
    </ScopedIntlProvider>
  ) : (
    view
  );
};
