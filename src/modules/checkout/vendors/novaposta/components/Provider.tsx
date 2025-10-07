'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { loadNovapostaMessages } from '../i18n';
import { ProviderComponentProps } from '@src/modules/checkout/vendors/types';

/**
 * NovaPoshta payment provider-level component that renders payment UI.
 * Receives explicit validation callbacks following enterprise patterns.
 */
export function NPProvider({
  availableMethods,
  onValid,
  onInvalid,
  selectedMethod,
  config,
}: ProviderComponentProps) {
  const { styles } = useStyles();

  const handleSelectMethod = () => {};

  return (
    <ScopedIntlProvider scope="novaposta" load={loadNovapostaMessages}>
      <Flex vertical gap={12} className={styles.container}>
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
                isActive={selectedMethod?.code === config.code}
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

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));
