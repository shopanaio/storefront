import { Flex, Input, Typography, Button, Divider } from "antd";
import { createStyles } from "antd-style";
import { SummaryItem } from "@src/modules/checkout/SummaryItem";
import { useTranslations } from "next-intl";
import { ApiCheckout } from "@codegen/schema-client";
import { TbTicket } from "react-icons/tb";
import { mq } from "@src/components/Theme/breakpoints";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Money } from "@src/components/UI/Price/Money";
import { CartDrawer } from "@src/components/Cart/CartDrawerDynamic";

const { Text } = Typography;

interface Prop {
  cart: ApiCheckout;
  onConfirm: () => void;
}

export const Summary = ({ cart, onConfirm }: Prop) => {
  const t = useTranslations("Checkout");
  const { styles } = useStyles();
  const pathname = usePathname();
  const isBoxBuilder = pathname?.includes("/box-builder");

  const [, setCartDrawerOpen] = useState(false);
  const openCartDrawer = () => setCartDrawerOpen(true);

  const handleConfirmOrder = () => {
    if (isBoxBuilder) {
      // If we're in box-builder, go to next step
      onConfirm();
    } else {
      // Normal logic for checkout
      console.log("clicked");
    }
  };

  return (
    <>
      <Flex align="center" justify="space-between">
        <Text className={styles.sectionTitle} strong>
          {t("order-summary")}
        </Text>
        <Button type="link" onClick={() => openCartDrawer()}>
          Edit
        </Button>
      </Flex>

      <Flex vertical gap={8}>
        {(cart?.lines ?? []).map((line) => (
          <SummaryItem key={line.id} product={line} />
        ))}
      </Flex>

      <Divider className={styles.divider} />

      <Flex vertical gap={12}>
        <Text>{t("coupon-code")}</Text>

        <Input
          className={styles.couponInput}
          placeholder={t("coupon-code")}
          prefix={<TbTicket className={styles.placeholderIcon} size={18} />}
          suffix={<Button>{t("apply")}</Button>}
        />
      </Flex>

      <Divider className={styles.divider} />

      <Flex vertical gap={12}>
        <Flex justify="space-between">
          <Text className={styles.summaryRow} strong>
            {t("subtotal")}
          </Text>
          <Text className={styles.summaryRow} strong>
            <Money money={cart.cost.subtotalAmount} />
          </Text>
        </Flex>
        <Flex justify="space-between">
          <Text className={styles.summaryRow} strong>
            {t("shipping")}
          </Text>
          <Text className={styles.summaryRow} strong>
            {cart?.cost?.totalShippingAmount ? (
              <Money money={cart.cost.totalShippingAmount} />
            ) : (
              ""
            )}
          </Text>
        </Flex>
        <Flex justify="space-between">
          <Text className={styles.summaryRow} strong>
            {t("tax")}
          </Text>
          <Text className={styles.summaryRow} strong>
            {cart?.cost?.totalTaxAmount ? (
              <Money money={cart.cost.totalTaxAmount} />
            ) : (
              ""
            )}
          </Text>
        </Flex>
      </Flex>

      <Divider className={styles.divider} />

      <Flex vertical gap={12}>
        <Flex justify="space-between">
          <Text className={styles.summaryTotal}>{t("total")}</Text>
          <Text className={styles.summaryTotal}>
            {cart ? <Money money={cart.cost.totalAmount} /> : null}
          </Text>
        </Flex>
        <Button
          type="primary"
          size="large"
          htmlType="submit"
          onClick={handleConfirmOrder}
        >
          {t("confirm-order")}
        </Button>
        <Text>
          {t("confirm-note")}{" "}
          <Button className={styles.confirmLinkBtn} type="link">
            {t("terms-service")}
          </Button>{" "}
          {t("and")}{" "}
          <Button className={styles.confirmLinkBtn} type="link">
            {t("privacy-notice")}
          </Button>
          .
        </Text>
      </Flex>

      <CartDrawer />
    </>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  sectionTitle: css`
    font-size: ${token.fontSizeLG}px;
    ${mq.lg} {
      font-size: ${token.fontSizeLG}px;
    }
    ${mq.xl} {
      font-size: ${token.fontSizeXL}px;
    }
  `,
  divider: css`
    margin: 0;
  `,
  couponInput: css`
    padding: ${token.paddingXS}px;
  `,
  placeholderIcon: css`
    color: ${token.colorTextPlaceholder};
  `,
  summaryRow: css`
    ${mq.md} {
      font-size: ${token.fontSizeLG}px;
    }
  `,
  summaryTotal: css`
    font-size: ${token.fontSizeLG}px;
    font-weight: 900;
    ${mq.md} {
      font-size: ${token.fontSizeXL}px;
    }
  `,
  confirmLinkBtn: css`
    padding: 0;
    text-decoration: underline;
  `,
}));
