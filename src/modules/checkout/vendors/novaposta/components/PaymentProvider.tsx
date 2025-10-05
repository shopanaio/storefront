'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import type { ProviderProps } from '@src/modules/registry';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { loadNovapostaMessages } from '../i18n';
import { NOVA_POSHTA_CONFIG } from './config';
import { useMethodSelection } from '@src/modules/checkout/state/hooks/useMethodSelection';

/**
 * NovaPoshta payment provider-level component that renders payment UI.
 * Receives method controllers through props and passes them down to method components.
 */
export function NPPaymentProvider({ methods, provider }: ProviderProps) {
  const { styles } = useStyles();
  const { selected, select } = useMethodSelection('payment');
  const activeCode: string | undefined = selected?.code;

  const handleSelectMethod = (code: string) => {
    select({ code, vendor: provider });
  };

  return (
    <ScopedIntlProvider scope="novaposta" load={loadNovapostaMessages}>
      <Flex vertical gap={12} className={styles.container}>
        {methods
          .map((m) => {
            const config = NOVA_POSHTA_CONFIG.payment.find(
              (p) => p.code === m.code
            );
            if (!config) {
              return null;
            }

            const MethodComponent = config.Component;
            return (
              <MethodComponent
                key={m.code}
                isActive={activeCode === config.code}
                onActivate={() => handleSelectMethod(config.code)}
                controller={m.controller}
                initialValues={m.initialValues}
              />
            );
          })
          .filter(Boolean)}
      </Flex>
    </ScopedIntlProvider>
  );
}

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));
