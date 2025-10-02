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

/**
 * NovaPoshta payment provider-level component that renders payment UI.
 * Uses react-hook-form via useFormContext.
 */
export function NPPaymentProvider({ methods }: ProviderProps) {
  const { styles } = useStyles();
  const form = useFormContext();

  const activeCode: string | undefined = form?.watch?.('payment');

  // Ensure there is always a valid active method code selected
  const allCodes = methods.map((m) => m.code);
  if (!activeCode || !allCodes.includes(activeCode)) {
    if (allCodes.length > 0) {
      form?.setValue?.('payment', allCodes[0], {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }

  const handleSelectMethod = (code: string) => {
    form?.setValue?.('payment', code, {
      shouldDirty: true,
      shouldTouch: true,
    });
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
    <Flex vertical gap={16} className={styles.container}>
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
