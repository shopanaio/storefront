"use client";

import { Button, Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { useLocale, useTranslations } from "next-intl";
import { Price } from "../UI/Price/Price";
const { Text } = Typography;

interface CartSubtotalProps {
  subtotal: {
    amount: number;
    currencyCode: string;
  };
}

export const CartSubtotal: React.FC<CartSubtotalProps> = ({ subtotal }) => {
  const locale = useLocale();

  const t = useTranslations("Cart");
  const { styles } = useStyles();

  return (
    <Flex className={styles.subtotalBox} vertical gap={16}>
      <Flex vertical gap={12}>
        <Flex justify="space-between">
          <Text className={styles.subtotalTitle} strong>
            {t("subtotal")}
          </Text>
          <Text className={styles.subtotal} strong>
            <Price money={subtotal} />
          </Text>
        </Flex>

        <Text className={styles.subtotalNote}>{t("tax-note")}</Text>
      </Flex>

      <Button href={`/${locale}/checkout`} type="primary" size="large">
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
