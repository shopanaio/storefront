'use client';

import { Flex } from 'antd';
import type { ProviderProps } from '@src/modules/registry';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { loadBankTransferMessages } from '../i18n';
import { BANK_TRANSFER_CONFIG } from './config';
import { useMethodSelection } from '@src/modules/checkout/state/hooks/useMethodSelection';
import { ProviderBoundary } from '@checkout/components/common/ProviderBoundary';

/**
 * Bank Transfer payment provider-level component that renders payment UI.
 * Uses react-hook-form via useFormContext.
 */
export function BTPaymentProvider({ methods, provider }: ProviderProps) {
  const { selected, select } = useMethodSelection('payment');
  const activeCode: string | undefined = selected?.code;

  const handleSelectMethod = (code: string) => {
    select({ code, vendor: provider });
  };

  return (
    <ScopedIntlProvider scope="bankTransfer" load={loadBankTransferMessages}>
      <Content
        methods={methods}
        activeCode={activeCode}
        onSelect={handleSelectMethod}
        provider={provider}
      />
    </ScopedIntlProvider>
  );
}

function Content({
  methods,
  activeCode,
  onSelect,
  provider,
}: {
  methods: ProviderProps['methods'];
  activeCode?: string;
  onSelect: (code: string) => void;
  provider: string;
}) {
  const providerId = `payment:${provider}` as const;

  return (
    <Flex vertical gap={16}>
      {methods
        .map((m) => {
          const config = BANK_TRANSFER_CONFIG.payment.find(
            (p) => p.code === m.code
          );
          if (!config) {
            return null;
          }

          const MethodComponent = config.Component;
          return (
            <ProviderBoundary key={m.code} providerId={providerId} type="payment">
              <MethodComponent
                isActive={activeCode === config.code}
                onActivate={() => onSelect(config.code)}
              />
            </ProviderBoundary>
          );
        })
        .filter(Boolean)}
    </Flex>
  );
}
