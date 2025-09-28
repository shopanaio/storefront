import { Flex, Input, Typography, Button, Divider } from "antd";
import { createStyles } from "antd-style";
import { SummaryItem } from "@src/modules/checkout/SummaryItem";
import { useTranslations } from "next-intl";
import { TbShoppingCart, TbTicket } from "react-icons/tb";
import { mq } from "@src/components/Theme/breakpoints";
import { useState } from "react";
import { Money } from "@src/components/UI/Price/Money";
import { CartDrawer } from "@src/components/Cart/CartDrawerDynamic";
import { Entity } from "@src/entity";

const { Text } = Typography;

interface Prop {
  cart: Entity.Cart;
}

export const Summary = ({ cart }: Prop) => {
  const t = useTranslations("Checkout");
  const { styles } = useStyles();

  const [, setCartDrawerOpen] = useState(false);
  const openCartDrawer = () => setCartDrawerOpen(true);

  return (
    <>
      <Flex align="center" justify="space-between">
        <Text className={styles.sectionTitle} strong>
          {t("order-summary")}
        </Text>
        <Button
          color="default"
          variant="text"
          onClick={() => openCartDrawer()}
          icon={<TbShoppingCart size={20} />}
        />
      </Flex>

      <Flex vertical gap={8}>
        {(cart?.lines ?? []).map((line) => (
          <SummaryItem key={line.id} line={line} />
        ))}
      </Flex>

      <Divider className={styles.divider} />

      <Flex vertical gap={8}>
        <Text>{t("coupon-code")}</Text>
        <Input
          placeholder={t("coupon-code")}
          prefix={<TbTicket size={20} />}
          suffix={<Button disabled>{t("apply")}</Button>}
          styles={{
            input: {
              paddingInline: 12,
            },
            affixWrapper: {
              paddingLeft: 12,
              paddingRight: 6,
              paddingBlock: 6,
            },
          }}
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
      </Flex>
      <CartDrawer />
    </>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  sectionTitle: css`
    font-size: ${token.fontSizeLG}px;
  `,
  divider: css`
    margin: 0;
  `,
  placeholderIcon: css`
    color: ${token.colorTextPlaceholder};
  `,
  summaryRow: css`
    font-size: ${token.fontSizeLG}px;
  `,
  summaryTotal: css`
    font-weight: 900;
    font-size: ${token.fontSizeXL}px;
  `,
  confirmLinkBtn: css`
    padding: 0;
    text-decoration: underline;
  `,
}));
