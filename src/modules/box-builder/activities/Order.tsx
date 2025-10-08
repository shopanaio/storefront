'use client';

import { Button, Flex, Tag, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { FinishBox } from '@src/modules/box-builder/Images/FinishBox';
import { ActivityComponentType } from '@stackflow/react';
import Layout from '@src/modules/box-builder/stackflow/Layout';
import { Activity, useFlow } from '@src/modules/box-builder/stackflow/Stack';
import dynamic from 'next/dynamic';

const ConfettiEffect = dynamic(
  () =>
    import('@src/modules/box-builder/components/ConfettiEffect').then(
      (mod) => mod.ConfettiEffect
    ),
  { ssr: false }
);

const { Text } = Typography;

const Order: ActivityComponentType = () => {
  const { styles } = useStyles();
  const t = useTranslations('BoxBuilder');
  const { push } = useFlow();

  const handleCreateNewBox = () => {
    window.location.reload();
  };

  const handleBackToSite = () => {
    push(Activity.Step1, {});
  };

  const footerContent = (
    <Flex vertical gap={20}>
      <Flex vertical gap={4}>
        <Flex gap={4}>
          <Text className={styles.orderNumberTitle} strong>
            {t('finish-box.order-number')}
          </Text>
          <Tag color="processing">#1001</Tag>
        </Flex>
        <Text>{t('finish-box.order-number-description')}</Text>
      </Flex>
      <Flex gap={12} vertical>
        <Button type="primary" size="large" onClick={handleCreateNewBox}>
          {t('finish-box.create-new-box')}
        </Button>
        <Button variant="outlined" size="large" onClick={handleBackToSite}>
          {t('finish-box.back-to-site')}
        </Button>
      </Flex>
    </Flex>
  );

  return (
    <Layout showCart={false} showBackButton={false} footer={footerContent}>
      <ConfettiEffect />
      <Flex vertical className={styles.container} gap={32}>
        <Flex
          className={styles.content}
          vertical
          align="center"
          justify="center"
          gap={36}
        >
          <FinishBox />
          <Flex vertical gap={4} align="center">
            <Text strong className={styles.title}>
              {t('finish-box.title')}
            </Text>
            <Text className={styles.description}>
              {t('finish-box.description')}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Layout>
  );
};

export default Order;

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      padding: 0 0 ${token.padding}px;
      min-height: max-content;
      height: 100%;
    `,
    title: css`
      font-size: ${token.fontSizeXL}px;
    `,
    description: css`
      font-size: ${token.fontSizeLG}px;
    `,
    content: css`
      margin: 100px auto 0;
      max-width: 350px;
      text-align: center;
    `,
    orderNumberTitle: css`
      font-size: ${token.fontSizeLG}px;
    `,
  };
});
