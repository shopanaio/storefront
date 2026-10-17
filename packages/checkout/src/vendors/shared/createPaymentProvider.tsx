'use client';

import { Flex } from 'antd';
import { ScopedIntlProvider } from '#checkout/ui/ScopedIntlProvider';
import { ProviderComponentProps } from '#checkout/vendors/types';

/**
 * Builds the provider-level component of a payment module.
 *
 * Renders, in the order received, every available method that the module
 * declares, each with its own method component, inside the module i18n scope.
 */
export function createPaymentProvider({
  scope,
  load,
}: {
  scope: string;
  load: (locale: string) => Promise<Record<string, unknown>>;
}) {
  function PaymentProvider({
    availableMethods,
    selectedMethod,
    config,
    onSelectMethod,
    onUpdateMethodData,
    provider,
  }: ProviderComponentProps) {
    return (
      <ScopedIntlProvider scope={scope} load={load}>
        <Flex vertical gap={12}>
          {availableMethods.map((method) => {
            const methodConfig = config.methods.find(
              (m) => m.code === method.code
            );
            if (!methodConfig) {
              return null;
            }

            const MethodComponent = methodConfig.Component;
            return (
              <MethodComponent
                key={method.handle}
                isActive={selectedMethod?.handle === method.handle}
                onActive={() => onSelectMethod?.({ ...method, provider })}
                data={method.data}
                onSubmit={(data) => onUpdateMethodData?.(data)}
              />
            );
          })}
        </Flex>
      </ScopedIntlProvider>
    );
  }

  return PaymentProvider;
}
