'use client';

import { Flex, Typography, Button } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import type { SectionProps } from '@shopana/storefront-sdk/core/types';
import { Image404 } from '../../atoms/Image404';

const { Title, Text } = Typography;

export default function NotFoundSection(_props: SectionProps) {
  const { styles } = useStyles();
  const t = useTranslations('NotFound');

  const handleGoHome = () => {
    window.location.assign('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.imageWrapper}>
          <Image404 />
        </div>
        <Flex vertical>
          <Title level={1} className={styles.title}>
            {t('title')}
          </Title>
          <Text className={styles.description}>{t('description')}</Text>
          <Flex justify="center">
            <Button type="primary" size="large" onClick={handleGoHome}>
              {t('goHome')}
            </Button>
          </Flex>
        </Flex>
      </div>
    </div>
  );
}

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${token.paddingLG}px;
  `,
  content: css`
    max-width: 600px;
    width: 100%;
    text-align: center;
  `,
  imageWrapper: css`
    width: 100%;
    max-width: 400px;
    margin: -100px auto ${token.margin}px;
  `,
  title: css`
    font-size: ${token.fontSizeHeading3}px !important;
    font-weight: 700 !important;
    margin-bottom: ${token.margin}px !important;
    color: ${token.colorText};
  `,
  description: css`
    font-size: 16px;
    color: ${token.colorTextSecondary};
    margin-bottom: ${token.margin}px;
  `,
}));
