"use client";

import { Button, Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import { Money } from "@src/ui-kit/Price/Money";
import type { model } from "@shopana/storefront-sdk";
import { useRoutes } from "@src/hooks/useRoutes";
const { Text } = Typography;

interface CartSubtotalProps {
  subtotal: model.Money;
}

export const CartSubtotal: React.FC<CartSubtotalProps> = ({ subtotal }) => {
  const routes = useRoutes();

  const t = useTranslations("Cart");
  const { styles } = useStyles();

  return (
    <Flex className={styles.subtotalBox} vertical gap={16}>
      <Flex vertical gap={12}>
        <Flex justify="space-between">
          <Text className={styles.subtotalTitle} strong>
            {t("subtotal")}
          </Text>
          <Money
            className={styles.subtotal}
            strong
            money={subtotal}
            as={Text}
          />
        </Flex>
      </Flex>

      <Button href={routes.checkout.path()} type="primary" size="large">
        {t("checkout")}
      </Button>
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  subtotalBox: css`
    width: 100%;
    background: ${token.colorBgLayout};
    padding: ${token.padding}px;
    border-radius: ${token.borderRadiusLG}px;
    z-index: 1;
  `,
  subtotalTitle: css`
    font-size: 18px;
  `,
  subtotal: css`
    font-size: ${token.fontSizeXL}px;
  `,
  subtotalNote: css`
    font-size: ${token.fontSize}px;
  `,
}));
