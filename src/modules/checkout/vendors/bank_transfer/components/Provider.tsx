'use client';

import { Flex } from 'antd';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { loadBankTransferMessages } from '../i18n';
import { ProviderComponentProps } from '@src/modules/checkout/vendors/types';

/**
 * Bank Transfer payment provider-level component that renders payment UI.
 * Receives explicit validation callbacks following enterprise patterns.
 */
export function BTProvider({
  availableMethods,
  selectedMethod,
  config,
  onSelectMethod,
  onUpdateMethodData,
  provider,
}: ProviderComponentProps) {
  const activeCode: string | undefined = selectedMethod?.code;

  const handleSelectMethod = (code: string) => {
    const method = availableMethods.find((m) => m.code === code);
    if (method && onSelectMethod) {
      onSelectMethod({ ...method, provider });
    }
  };

  const handleUpdateMethodData = (data: unknown) => {
    if (onUpdateMethodData) {
      onUpdateMethodData(data);
    }
  };

  return (
    <ScopedIntlProvider scope="bankTransfer" load={loadBankTransferMessages}>
      <Flex vertical gap={16}>
        {config.methods
          .map((config) => {
            const method = availableMethods.find((m) => m.code === config.code);
            if (!method) {
              return null;
            }

            const MethodComponent = config.Component;
            return (
              <MethodComponent
                key={config.code}
                isActive={activeCode === config.code}
                onActive={() => handleSelectMethod(config.code)}
                data={method.data}
                onSubmit={handleUpdateMethodData}
              />
            );
          })
          .filter(Boolean)}
      </Flex>
    </ScopedIntlProvider>
  );
}
