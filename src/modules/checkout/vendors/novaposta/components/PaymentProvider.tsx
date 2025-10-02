'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useFormContext } from 'react-hook-form';
import type { ProviderProps } from '@src/modules/registry';
import { CheckoutMethodPanel } from '@src/modules/checkout/components/CheckoutMethodPanel';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { useTranslations } from 'next-intl';
import { loadNovapostaMessages } from '../i18n';
import { NOVA_POSHTA_CONFIG } from './config';
import { useSelectedPaymentMethod } from '@src/modules/checkout/hooks/useSelectedPaymentMethod';

/**
 * NovaPoshta payment provider-level component that renders payment UI.
 * Uses react-hook-form via useFormContext.
 */
export function NPPaymentProvider({ methods }: ProviderProps) {
  const { styles } = useStyles();
  const { selectedPaymentMethod, setSelectedPaymentMethod } = useSelectedPaymentMethod();
  const activeCode: string | undefined = selectedPaymentMethod?.code;

  // Removed auto-initialization to avoid implicit state updates.

  const handleSelectMethod = (code: string) => {
    setSelectedPaymentMethod({ code });
  };

  return (
    <ScopedIntlProvider scope="novaposta" load={loadNovapostaMessages}>
      <Content
        methods={methods}
        activeCode={activeCode}
        onSelect={handleSelectMethod}
        styles={styles}
      />
    </ScopedIntlProvider>
  );
}

function Content({
  methods,
  activeCode,
  onSelect,
  styles,
}: {
  methods: ProviderProps['methods'];
  activeCode?: string;
  onSelect: (code: string) => void;
  styles: ReturnType<typeof useStyles>['styles'];
}) {
  const t = useTranslations('Modules.novaposta');

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

          const FormComponent = config.Component;
          const BrandComponent = NOVA_POSHTA_CONFIG.logo;

          return (
            <CheckoutMethodPanel
              key={m.code}
              title={t(config.nameI18n)}
              description={
                config.descriptionI18n ? t(config.descriptionI18n) : ''
              }
              isActive={activeCode === m.code}
              onActivate={() => onSelect(m.code)}
              brand={<BrandComponent size={24} />}
              content={typeof FormComponent === 'function' && <FormComponent />}
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
