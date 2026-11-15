'use client';

import { Flex } from 'antd';
import { ProviderComponentProps } from '#checkout/vendors/types';

/**
 * Nova Poshta delivery provider: renders every option whose service the module knows, always
 * in the order of the module's services (branch, postomat, courier), whatever the API order is,
 * each with the form of its receiving type.
 */
export function NPProvider({
  availableMethods,
  selectedMethod,
  config,
  onSelectMethod,
  onUpdateMethodData,
  provider,
  deliveryAddress,
}: ProviderComponentProps) {
  const position = (code: string) =>
    config.methods.findIndex((m) => m.code === code);
  const ordered = [...availableMethods].sort(
    (a, b) => position(a.code) - position(b.code)
  );
  return (
    <Flex vertical gap={12}>
      {ordered.map((method) => {
        const methodConfig = config.methods.find((m) => m.code === method.code);
        if (!methodConfig) {
          return null;
        }

        const MethodComponent = methodConfig.Component;
        const isActive = selectedMethod?.handle === method.handle;
        return (
          <MethodComponent
            key={method.handle}
            isActive={isActive}
            onActive={() => onSelectMethod?.({ ...method, provider })}
            data={method.data}
            view={method.view}
            customerInputContract={method.customerInputContract}
            title={method.title}
            description={method.description}
            publicData={method.publicData}
            carrierChargeWaived={method.carrierChargeWaived}
            onSubmit={(data, view) =>
              onUpdateMethodData?.(method.handle, data, view)
            }
            deliveryAddress={deliveryAddress}
          />
        );
      })}
    </Flex>
  );
}
