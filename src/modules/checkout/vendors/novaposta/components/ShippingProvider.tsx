'use client';

import { Flex } from 'antd';
import type { ProviderProps } from '@src/modules/registry';
import { NOVA_POSHTA_CONFIG } from './config';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { loadNovapostaMessages } from '../i18n';
import { useMethodSelectionShipping } from '@src/modules/checkout/state/hooks/useMethodSelection';
import { ProviderBoundary } from '@checkout/components/common/ProviderBoundary';

/**
 * Configuration for Nova Poshta provider methods.
 * Contains two shipping methods and one COD payment method.
 */

/**
 * NovaPoshta provider-level component that renders full shipping UI.
 * Uses react-hook-form via useFormContext.
 */
export function NPShippingProvider({
  methods,
  groupId,
  provider,
}: ProviderProps) {
  const { selected, select } = useMethodSelectionShipping(groupId as string);
  const activeCode: string | undefined = selected?.code;

  const handleSelectMethod = (code: string) => {
    select({ code, vendor: provider });
  };

  return (
    <ScopedIntlProvider scope="novaposta" load={loadNovapostaMessages}>
      <Content
        methods={methods}
        activeCode={activeCode}
        onSelect={handleSelectMethod}
        provider={provider}
        groupId={groupId as string}
      />
    </ScopedIntlProvider>
  );
}

function Content({
  methods,
  activeCode,
  onSelect,
  provider,
  groupId,
}: {
  methods: ProviderProps['methods'];
  activeCode?: string;
  onSelect: (code: string) => void;
  provider: string;
  groupId?: string;
}) {
  const providerId = `shipping:${provider}@${groupId as string}` as const;

  return (
    <Flex vertical gap={12}>
      {NOVA_POSHTA_CONFIG.shipping
        .map((config) => {
          const method = methods.find((m) => m.code === config.code);
          if (!method) {
            return null;
          }

          const MethodComponent = config.Component;
          return (
            <ProviderBoundary
              key={method.code}
              providerId={providerId}
              type="shipping"
            >
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
