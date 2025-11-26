'use client';

import { Button, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { TbChevronRight } from 'react-icons/tb';
import { useTranslations } from 'next-intl';

export const AdditionalInfoSection = () => {
  const t = useTranslations('Product');
  const { styles } = useStyles();

  return (
    <Flex vertical gap={12}>
      <Button
        className={styles.button}
        size="large"
        color="default"
        variant="text"
      >
        {t('delivery')} / {t('payment')}
        <TbChevronRight />
      </Button>
      <Button
        className={styles.button}
        size="large"
        color="default"
        variant="text"
      >
        {t('exchange-return')}
        <TbChevronRight />
      </Button>
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    display: flex;
    justify-content: space-between;
    min-height: 48px;
    border: 1px solid ${token.colorBorder};

    &:hover {
      background-color: ${token.colorBgTextHover} !important;
    }
  `,
}));
