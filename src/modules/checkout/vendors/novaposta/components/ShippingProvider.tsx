'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import type { ProviderProps } from '@src/modules/registry';
import { NOVA_POSHTA_CONFIG } from './config';
import { CheckoutMethodPanel } from '@checkout/components/common/CheckoutMethodPanel';
import { ScopedIntlProvider } from '@src/i18n/ScopedIntlProvider';
import { useTranslations } from 'next-intl';
import { loadNovapostaMessages } from '../i18n';
import { useSelectedShippingMethod } from '@src/modules/checkout/hooks/useSelectedShippingMethod';

/**
 * Configuration for Nova Poshta provider methods.
 * Contains two shipping methods and one COD payment method.
 */

/**
 * NovaPoshta provider-level component that renders full shipping UI.
 * Uses react-hook-form via useFormContext.
 */
export function NPShippingProvider({ methods }: ProviderProps) {
  const { styles } = useStyles();
  const { setSelectedShippingMethod, selectedShippingMethod } = useSelectedShippingMethod();
  const activeCode: string | undefined = selectedShippingMethod?.code;

  const handleSelectMethod = (code: string) => {
    setSelectedShippingMethod({ code });
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
              content={typeof FormComponent === 'function' && <FormComponent />}
            />
          );
        })
        .filter(Boolean)}
    </Flex>
  );
}

const useStyles = createStyles(({ css, token }) => ({
  container: css``,
  method: css`
    padding: ${token.paddingXS}px ${token.padding}px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
    cursor: pointer;
  `,
  methodActive: css`
    padding: ${token.paddingXS}px ${token.padding}px;
    border: 1px solid ${token.colorPrimary};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorPrimaryBg};
    cursor: pointer;
  `,
}));
