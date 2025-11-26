'use client';

import React from 'react';
import { TbPhone } from 'react-icons/tb';
import { useTranslations } from 'next-intl';
import useToken from 'antd/es/theme/useToken';
import { createStyles } from 'antd-style';
import { AppDrawerButton } from './AppDrawerButton';

/**
 * Support phone button for the app drawer
 */
export const AppDrawerSupportButton: React.FC = () => {
  const t = useTranslations('Header');
  const [, token] = useToken();
  const { styles } = useStyles();

  return (
    <AppDrawerButton
      icon={<TbPhone size={24} color={token.colorPrimary} />}
      topText={t('customer-support')}
      bottomText="+1 (999) 111-11-11"
      className={styles.button}
    />
  );
};

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    gap: ${token.marginXS}px;
  `,
}));
