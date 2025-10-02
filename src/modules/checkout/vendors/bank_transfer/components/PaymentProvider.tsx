'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useFormContext } from 'react-hook-form';
import type { ProviderProps } from '@src/modules/registry';
import { CheckoutMethodPanel } from '@src/modules/checkout/components/CheckoutMethodPanel';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { useTranslations } from 'next-intl';
import { loadBankTransferMessages } from '../i18n';
import { BANK_TRANSFER_CONFIG } from './config';

/**
 * Bank Transfer payment provider-level component that renders payment UI.
 * Uses react-hook-form via useFormContext.
 */
export function BTPaymentProvider({ methods }: ProviderProps) {
  const { styles } = useStyles();
  const form = useFormContext();

  const activeCode: string | undefined = form?.watch?.('payment');

  const handleSelectMethod = (code: string) => {
    form?.setValue?.('payment', code, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <ScopedIntlProvider scope="bankTransfer" load={loadBankTransferMessages}>
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
  const t = useTranslations('Modules.bankTransfer');

  return (
    <Flex vertical gap={16} className={styles.container}>
      {methods
        .map((m) => {
          const config = BANK_TRANSFER_CONFIG.payment.find(
            (p) => p.code === m.code
          );
          if (!config) {
            return null;
          }

          const FormComponent = config.Component;
          const BrandComponent = BANK_TRANSFER_CONFIG.logo;

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
