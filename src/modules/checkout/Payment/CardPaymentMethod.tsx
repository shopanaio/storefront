import { Checkbox, Flex } from "antd";
import { createStyles, cx } from "antd-style";
import { MethodCollapsePanel } from "../MethodCollapsePanel";
import { CardPaymentForm } from "./CardPaymentForm";
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import { CheckoutFormValues } from "../Checkout";
import { BillingAddress } from "./BillingAddress";
import { useTranslations } from "next-intl";
import { ApiCheckoutDeliveryMethod } from "@codegen/schema-client";

interface Props {
  method: ApiCheckoutDeliveryMethod;
  icon: string;
  activePayment: string;
  shippingAsBilling: boolean;
  setValue: UseFormSetValue<CheckoutFormValues>;
  control: Control<CheckoutFormValues>;
}

export const CardPaymentMethod = ({
  method,
  icon,
  activePayment,
  shippingAsBilling,
  setValue,
  control,
}: Props) => {
  const t = useTranslations("Checkout");

  const { styles } = useStyles();

  return (
    <MethodCollapsePanel
      key={method.code}
      value={method.code}
      // TODO: Prepare i18n title and description for the method
      title={method.code}
      buttonLabel={
        <div className={styles.methodLogoWrapper}>
          <img className={styles.methodLogo} src={icon} alt="" />
        </div>
      }
      activeKey={activePayment}
      setActiveKey={(key) => setValue("payment", key)}
    >
      <Flex vertical gap={16}>
        <CardPaymentForm control={control} />

        <Controller
          name="shippingAsBilling"
          control={control}
          render={({ field }) => (
            <Flex gap={8}>
              <Checkbox
                {...field}
                id="shipping-as-billing"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              <label htmlFor="shipping-as-billing">
                {t("use-shipping-as-billing")}
              </label>
            </Flex>
          )}
        />

        <div
          className={cx(
            styles.billingWrapper,
            shippingAsBilling ? styles.hidden : styles.visible
          )}
        >
          <BillingAddress
            control={control}
            shippingAsBilling={shippingAsBilling}
          />
        </div>
      </Flex>
    </MethodCollapsePanel>
  );
};

const useStyles = createStyles(({ css, token }) => {
  return {
    methodLogoWrapper: css`
      height: 46px;
      padding: ${token.paddingXXS}px;
      border-radius: ${token.borderRadius}px;
      border: 1px solid ${token.colorBorderSecondary};
    `,
    methodLogo: css`
      height: 100%;
      border-radius: ${token.borderRadius}px;
    `,
    billingWrapper: css`
      overflow: hidden;
      transition: max-height 0.4s ease, opacity 0.4s ease;
      will-change: max-height, opacity;
    `,
    hidden: css`
      max-height: 0;
      opacity: 0;
      pointer-events: none;
    `,
    visible: css`
      max-height: 800px;
      opacity: 1;
      pointer-events: auto;
    `,
  };
});
