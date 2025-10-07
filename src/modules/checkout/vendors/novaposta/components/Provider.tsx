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
  selectedMethod,
  config,
  onSelectMethod,
  onUpdateMethodData,
  provider,
}: ProviderComponentProps) {
  const { styles } = useStyles();

  const handleSelectMethod = (code: string) => {
    const method = availableMethods.find((m) => m.code === code);
    if (method && onSelectMethod) {
      onSelectMethod({ ...method, provider });
    }
  };

  const handleUpdateMethodData = (data: unknown) => {
    if (onUpdateMethodData) {
      onUpdateMethodData(data);
    }
  };

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
                onActive={() => handleSelectMethod(config.code)}
                data={method.data}
                onSubmit={handleUpdateMethodData}
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
