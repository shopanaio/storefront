'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import type { ProviderProps } from '@src/modules/registry';
import { ProviderMethodPanel } from '@checkout/components/common/ProviderMethodPanel';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { useTranslations } from 'next-intl';
import { loadNovapostaMessages } from '../i18n';
import { NOVA_POSHTA_CONFIG } from './config';
import { useMethodSelection } from '@src/modules/checkout/state/hooks/useMethodSelection';

/**
 * NovaPoshta payment provider-level component that renders payment UI.
 * Uses react-hook-form via useFormContext.
 */
export function NPPaymentProvider({ methods, provider }: ProviderProps) {
  const { styles } = useStyles();
  const { selected, select } = useMethodSelection('payment');
  const activeCode: string | undefined = selected?.code;

  // Removed auto-initialization to avoid implicit state updates.

  const handleSelectMethod = (code: string) => {
    select({ code, vendor: provider });
  };

  return (
    <ScopedIntlProvider scope="novaposta" load={loadNovapostaMessages}>
      <Content
        methods={methods}
        activeCode={activeCode}
        onSelect={handleSelectMethod}
        styles={styles}
        provider={provider}
      />
    </ScopedIntlProvider>
  );
}

function Content({
  methods,
  activeCode,
  onSelect,
  styles,
  provider,
}: {
  methods: ProviderProps['methods'];
  activeCode?: string;
  onSelect: (code: string) => void;
  styles: ReturnType<typeof useStyles>['styles'];
  provider: string;
}) {
  const t = useTranslations('Modules.novaposta');
  const BrandComponent = NOVA_POSHTA_CONFIG.logo;

  return (
    <Flex vertical gap={12} className={styles.container}>
      {methods
        .map((m) => {
          const config = NOVA_POSHTA_CONFIG.payment.find(
            (p) => p.code === m.code
          );
          if (!config) {
            return null;
          }

          return (
            <ProviderMethodPanel
              key={m.code}
              config={config}
              activeCode={activeCode}
              onSelect={onSelect}
              brand={<BrandComponent size={24} />}
              translate={t}
              providerId={`payment:${provider}`}
              type="payment"
              autoPublish
            />
          );
        })
        .filter(Boolean)}
    </Flex>
  );
}

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));
