'use client';

import { Flex } from 'antd';
import { ScopedIntlProvider } from '#checkout/ui/ScopedIntlProvider';
import { loadNovaPoshtaMessages, NOVA_POSHTA_SCOPE } from '../i18n';
import { ProviderComponentProps } from '#checkout/vendors/types';

/**
 * Nova Poshta delivery provider: renders, in API order, every option whose service the
 * module knows, each with the form of its receiving type.
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
  return (
    <ScopedIntlProvider scope={NOVA_POSHTA_SCOPE} load={loadNovaPoshtaMessages}>
      <Flex vertical gap={12}>
        {availableMethods.map((method) => {
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
    </ScopedIntlProvider>
  );
}
