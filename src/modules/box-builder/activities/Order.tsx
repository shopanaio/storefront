"use client";

import { Button, Flex, Tag, Typography } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import { FullBoxImg } from "../Images/FullBoxImg";
import { ActivityComponentType } from "@stackflow/react";
import Layout from "../stackflow/Layout";
import { actions, Activity, useFlow } from "../stackflow/Stack";

const { Text } = Typography;

const Order: ActivityComponentType = () => {
  const { styles } = useStyles();
  const t = useTranslations("BoxBuilder");
  const { push } = useFlow();

  const handleCreateNewBox = () => {
    push(Activity.Step1, {});
  };

  const handleBackToSite = () => {
    push(Activity.Step1, {});
  };

  const footerContent = (
    <Flex vertical gap={20}>
      <Flex vertical gap={4}>
        <Flex gap={4}>
          <Text className={styles.orderNumberTitle} strong>
            {t("finish-box.order-number")}
          </Text>
          <Tag color="processing">#1001</Tag>
        </Flex>
        <Text>{t("finish-box.order-number-description")}</Text>
      </Flex>

      <Flex gap={12} vertical>
        <Button type="primary" size="large" onClick={handleCreateNewBox}>
          {t("finish-box.create-new-box")}
        </Button>

        <Button variant="outlined" size="large" onClick={handleBackToSite}>
          {t("finish-box.back-to-site")}
        </Button>
      </Flex>
    </Flex>
  );

  return (
    <Layout showCart={false} footer={footerContent}>
      <Flex vertical className={styles.container} gap={32}>
        <Flex
          className={styles.emptyContainer}
          vertical
          align="center"
          justify="center"
          gap={36}
        >
          <FullBoxImg />

          <Flex vertical gap={4} align="center">
            <Text strong className={styles.emptyTitle}>
              {t("finish-box.title")}
            </Text>
            <Text className={styles.emptyDescription}>
              {t("finish-box.description")}
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

    emptyTitle: css`
      font-size: ${token.fontSizeXL}px;
    `,

    emptyDescription: css`
      font-size: ${token.fontSizeLG}px;
    `,

    emptyContainer: css`
      margin-top: 50%;
      transform: translateY(-50%);
    `,
    orderNumberTitle: css`
      font-size: ${token.fontSizeLG}px;
    `,
  };
});
