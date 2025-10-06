'use client';

import { Flex } from 'antd';
import { NOVA_POSHTA_CONFIG } from './config';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { loadNovapostaMessages } from '../i18n';
import { ProviderComponentProps } from '@src/modules/checkout/vendors/types';

/**
 * NovaPoshta provider-level component that renders full shipping UI.
 * Receives explicit validation callbacks following enterprise patterns.
 */
export function NPShippingProvider({
  methods,
  onValid,
  onInvalid,
  selectedMethod,
}: ProviderComponentProps) {
  const activeCode: string | undefined = selectedMethod?.code;

  const handleSelectMethod = () => {};

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
                onActivate={() => handleSelectMethod()}
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
