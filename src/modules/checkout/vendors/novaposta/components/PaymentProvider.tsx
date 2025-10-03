'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import type { ProviderProps } from '@src/modules/registry';
import { CheckoutMethodPanel } from '@checkout/components/common/CheckoutMethodPanel';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { useTranslations } from 'next-intl';
import { loadNovapostaMessages } from '../i18n';
import { NOVA_POSHTA_CONFIG } from './config';
import { useMethodSelection } from '@src/modules/checkout/state/hooks/useMethodSelection';
import { useProviderController } from '@src/modules/checkout/state/hooks/useProviderController';
import { ProviderControllerProvider } from '@src/modules/checkout/state/context/ProviderControllerContext';

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
              content={
                typeof FormComponent === 'function' && activeCode === m.code ? (
                  <ActiveProviderBoundary providerId={`payment:${provider}`}>
                    <FormComponent />
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

function ActiveProviderBoundary({ providerId, children }: { providerId: string; children: React.ReactNode }) {
  const controller = useProviderController(providerId as any, 'payment');
  if (!controller.active) return null;
  return (
    <ProviderControllerProvider value={{
      publishValid: controller.publishValid,
      publishInvalid: controller.publishInvalid,
      reset: controller.reset,
    }}>
      {children}
    </ProviderControllerProvider>
  );
}

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));
