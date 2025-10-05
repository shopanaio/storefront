'use client';

import { Flex } from 'antd';
import type { ProviderProps } from '@src/modules/registry';
import { NOVA_POSHTA_CONFIG } from './config';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { loadNovapostaMessages } from '../i18n';
import { useMethodSelectionShipping } from '@src/modules/checkout/state/hooks/useMethodSelection';

/**
 * NovaPoshta provider-level component that renders full shipping UI.
 * Receives explicit validation callbacks following enterprise patterns.
 */
export function NPShippingProvider({
  methods,
  groupId,
  provider,
  onValid,
  onInvalid,
}: ProviderProps) {
  const { selected, select } = useMethodSelectionShipping(groupId as string);
  const activeCode: string | undefined = selected?.code;

  const handleSelectMethod = (code: string) => {
    select({ code, vendor: provider });
  };

  return (
    <ScopedIntlProvider scope="novaposta" load={loadNovapostaMessages}>
      <Flex vertical gap={12}>
        {NOVA_POSHTA_CONFIG.shipping
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
