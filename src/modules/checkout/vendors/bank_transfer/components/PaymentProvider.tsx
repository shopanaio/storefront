'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import type { ProviderProps } from '@src/modules/registry';
import { CheckoutMethodPanel } from '@checkout/components/common/CheckoutMethodPanel';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { useTranslations } from 'next-intl';
import { loadBankTransferMessages } from '../i18n';
import { BANK_TRANSFER_CONFIG } from './config';
import { useMethodSelection } from '@src/modules/checkout/state/hooks/useMethodSelection';
import { useProviderController } from '@src/modules/checkout/state/hooks/useProviderController';
import { ProviderControllerProvider } from '@src/modules/checkout/state/context/ProviderControllerContext';

/**
 * Bank Transfer payment provider-level component that renders payment UI.
 * Uses react-hook-form via useFormContext.
 */
export function BTPaymentProvider({ methods, provider }: ProviderProps) {
  const { styles } = useStyles();
  const { selected, select } = useMethodSelection('payment');
  const activeCode: string | undefined = selected?.code;

  const handleSelectMethod = (code: string) => {
    select({ code, vendor: provider });
  };

  return (
    <ScopedIntlProvider scope="bankTransfer" load={loadBankTransferMessages}>
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
              content={
                activeCode === m.code ? (
                  <ActiveProviderBoundary providerId={`payment:${provider}`} autoPublishEmpty>
                    {typeof FormComponent === 'function' ? <FormComponent /> : null}
                  </ActiveProviderBoundary>
                ) : null
              }
            />
          );
        })
        .filter(Boolean)}
    </Flex>
  );
}

function ActiveProviderBoundary({ providerId, autoPublishEmpty, children }: { providerId: string; autoPublishEmpty?: boolean; children: React.ReactNode }) {
  const controller = useProviderController(providerId as any, 'payment');
  // Auto-publish valid for methods without forms when active
  if (controller.active && autoPublishEmpty) {
    // publishValid with empty data to mark provider as valid
    controller.publishValid({});
  }
  if (!controller.active) return null;
  return (
    <ProviderControllerProvider
      value={{
        publishValid: controller.publishValid,
        publishInvalid: controller.publishInvalid,
        reset: controller.reset,
      }}
    >
      {children}
    </ProviderControllerProvider>
  );
}

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));
