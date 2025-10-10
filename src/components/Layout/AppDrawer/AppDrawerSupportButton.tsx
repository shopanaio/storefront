'use client';

import React from 'react';
import { Flex, Typography } from 'antd';
import { TbPhone } from 'react-icons/tb';
import { useTranslations } from 'next-intl';
import useToken from 'antd/es/theme/useToken';
import { createStyles } from 'antd-style';
import { AppDrawerButton } from './AppDrawerButton';

const { Text } = Typography;

/**
 * Support phone button for the app drawer
 */
export const AppDrawerSupportButton: React.FC = () => {
  const t = useTranslations('Header');
  const [, token] = useToken();
  const { styles } = useStyles();

  return (
    <AppDrawerButton
      icon={<TbPhone size={20} color={token.colorPrimary} />}
      className={styles.button}
    >
      <Flex className={styles.textWrapper} vertical>
        <Text className={styles.topText}>{t('customer-support')}</Text>
        <Text strong>+1 (999) 111-11-11</Text>
      </Flex>
    </AppDrawerButton>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    gap: ${token.marginXS}px;
  `,
  textWrapper: css`
    align-items: flex-start;
    gap: 0;
  `,
  topText: css`
    font-size: ${token.fontSizeSM}px;
    line-height: 1;
    color: ${token.colorTextTertiary};
  `,
}));
