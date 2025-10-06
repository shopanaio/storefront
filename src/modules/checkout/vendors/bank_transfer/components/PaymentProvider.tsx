'use client';

import { Flex } from 'antd';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { loadBankTransferMessages } from '../i18n';
import { BANK_TRANSFER_CONFIG } from './config';
import { ProviderProps } from '@src/modules/checkout/vendors/types';

/**
 * Bank Transfer payment provider-level component that renders payment UI.
 * Receives explicit validation callbacks following enterprise patterns.
 */
export function BTPaymentProvider({
  methods,
  provider,
  onValid,
  onInvalid,
  selectedMethod,
}: ProviderProps) {
  const activeCode: string | undefined = selected?.code;

  const handleSelectMethod = (code: string) => {};

  return (
    <ScopedIntlProvider scope="bankTransfer" load={loadBankTransferMessages}>
      <Flex vertical gap={16}>
        {BANK_TRANSFER_CONFIG.payment
          .map((config) => {
            const method = methods.find((m) => m.code === config.code);
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
