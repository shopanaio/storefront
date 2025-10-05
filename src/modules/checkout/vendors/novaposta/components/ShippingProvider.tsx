'use client';

import { Flex } from 'antd';
import type { ProviderProps } from '@src/modules/registry';
import { NOVA_POSHTA_CONFIG } from './config';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { loadNovapostaMessages } from '../i18n';
import { useMethodSelectionShipping } from '@src/modules/checkout/state/hooks/useMethodSelection';

/**
 * NovaPoshta provider-level component that renders full shipping UI.
 * Receives method controllers through props and passes them down to method components.
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
                key={method.code}
                isActive={activeCode === config.code}
                onActivate={() => handleSelectMethod(config.code)}
                controller={method.controller}
                initialValues={method.initialValues}
              />
            );
          })
          .filter(Boolean)}
      </Flex>
    </ScopedIntlProvider>
  );
}
