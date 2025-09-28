"use client";

import { Flex } from "antd";
import { createStyles } from "antd-style";
import { StepHeader } from "@src/modules/box-builder/components/StepHeader";
import { useTranslations } from "next-intl";
import { Checkout as CheckoutComponent } from "@src/modules/checkout";
import { ActivityComponentType } from "@stackflow/react";
import Layout from "@src/modules/box-builder/stackflow/Layout";
import { useBoxBuilderCart } from "@src/modules/box-builder/hooks/useCart";
import { Activity, useFlow } from "../stackflow/Stack";

const Checkout: ActivityComponentType = () => {
  const { styles } = useStyles();
  const t = useTranslations("BoxBuilder");
  const { push } = useFlow();
  const { cart } = useBoxBuilderCart();

  const handleConfirm = () => {
    push(Activity.Order, {});
  };

  return (
    <Layout showCart={false}>
      <Flex vertical className={styles.container} gap={32}>
        <div className={styles.titleWrapper}>
          <StepHeader title={t("step-placing.title")} />
        </div>
        <CheckoutComponent cart={cart} onConfirm={handleConfirm} />
      </Flex>
    </Layout>
  );
};

export default Checkout;

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      padding: 0 0 ${token.padding}px;
    `,

    titleWrapper: css`
      padding: 0 ${token.padding}px;
    `,
  };
});
