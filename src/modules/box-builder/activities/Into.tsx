"use client";

import { ActivityComponentType } from "@stackflow/react";
import { Flex } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import HowItWorks from "../HowItWorks";
import Layout from "../stackflow/Layout";
import { LayoutFooterButton } from "../stackflow/Layout";
import { Activity, useFlow } from "../stackflow/Stack";

const Into: ActivityComponentType = () => {
  const { styles } = useStyles();
  const t = useTranslations("BoxBuilder");
  const { replace } = useFlow();

  const handleFooterBtnClick = () => {
    replace(Activity.Step1, {});
  };

  return (
    <Layout
      showCart={false}
      footer={
        <LayoutFooterButton
          divider={null}
          onClick={handleFooterBtnClick}
          label={t("create-your-box")}
        />
      }
    >
      <Flex vertical className={styles.container} gap={32}>
        <HowItWorks />
      </Flex>
    </Layout>
  );
};

export default Into;

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0 ${token.padding}px;
    min-height: max-content;
    height: 100%;
  `,
}));
