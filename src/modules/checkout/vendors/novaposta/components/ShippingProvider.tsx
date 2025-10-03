'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import type { ProviderProps } from '@src/modules/registry';
import { NOVA_POSHTA_CONFIG } from './config';
import { CheckoutMethodPanel } from '@checkout/components/common/CheckoutMethodPanel';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { useTranslations } from 'next-intl';
import { loadNovapostaMessages } from '../i18n';
import { useMethodSelectionShipping } from '@src/modules/checkout/state/hooks/useMethodSelection';
import { useProviderController } from '@src/modules/checkout/state/hooks/useProviderController';
import { ProviderControllerProvider } from '@src/modules/checkout/state/context/ProviderControllerContext';

/**
 * Configuration for Nova Poshta provider methods.
 * Contains two shipping methods and one COD payment method.
 */

/**
 * NovaPoshta provider-level component that renders full shipping UI.
 * Uses react-hook-form via useFormContext.
 */
export function NPShippingProvider({ methods, groupId, provider }: ProviderProps) {
  const { styles } = useStyles();
  const { selected, select } = useMethodSelectionShipping(groupId as string);
  const activeCode: string | undefined = selected?.code;

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
        groupId={groupId as string}
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
  groupId,
}: {
  methods: ProviderProps['methods'];
  activeCode?: string;
  onSelect: (code: string) => void;
  styles: ReturnType<typeof useStyles>['styles'];
  provider: string;
  groupId?: string;
}) {
  const t = useTranslations('Modules.novaposta');

  return (
    <Flex vertical gap={12} className={styles.container}>
      {NOVA_POSHTA_CONFIG.shipping
        .map((config) => {
          const method = methods.find((m) => m.code === config.code);
          if (!method) {
            return null;
          }

          const FormComponent = config.Component;
          const BrandComponent = NOVA_POSHTA_CONFIG.logo;

          return (
            <CheckoutMethodPanel
              key={method.code}
              title={t(config.nameI18n)}
              description={
                config.descriptionI18n ? t(config.descriptionI18n) : ''
              }
              isActive={activeCode === method.code}
              onActivate={() => onSelect(method.code)}
              brand={<BrandComponent size={24} />}
              content={
                typeof FormComponent === 'function' && activeCode === method.code ? (
                  <ActiveProviderBoundary providerId={`shipping:${provider}@${(groupId as string)}`}>
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
  const controller = useProviderController(providerId as any, 'shipping');
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

const useStyles = createStyles(({ css, token }) => ({
  container: css``,
  method: css``,
}));
