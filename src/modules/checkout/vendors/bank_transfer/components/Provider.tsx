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
  onValid,
  onInvalid,
  selectedMethod,
  config,
}: ProviderComponentProps) {
  const activeCode: string | undefined = selectedMethod?.code;

  const handleSelectMethod = (code: string) => {
    console.log('handleSelectMethod', code);
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
                onActivate={() => handleSelectMethod(config.code)}
                onValid={onValid}
                onInvalid={onInvalid}
                initialValues={config.initialValues}
              />
            );
          })
          .filter(Boolean)}
      </Flex>
    </ScopedIntlProvider>
  );
}
