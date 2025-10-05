'use client';

import { Flex } from 'antd';
import type { ProviderProps } from '@src/modules/registry';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { loadBankTransferMessages } from '../i18n';
import { BANK_TRANSFER_CONFIG } from './config';
import { useMethodSelection } from '@src/modules/checkout/state/hooks/useMethodSelection';

/**
 * Bank Transfer payment provider-level component that renders payment UI.
 * Receives method controllers through props and passes them down to method components.
 */
export function BTPaymentProvider({ methods, provider, sectionController }: ProviderProps) {
  const { selected, select } = useMethodSelection('payment');
  const activeCode: string | undefined = selected?.code;

  const handleSelectMethod = (code: string) => {
    select({ code, vendor: provider });
  };

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
                sectionController={sectionController}
                initialValues={config.initialValues}
              />
            );
          })
          .filter(Boolean)}
      </Flex>
    </ScopedIntlProvider>
  );
}
