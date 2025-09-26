import { Flex, Typography, Button, Radio } from "antd";
import { createStyles } from "antd-style";
import { UseFormSetValue } from "react-hook-form";
import { CheckoutFormValues } from "../Checkout";
import { mq } from "@src/components/Theme/breakpoints";
const { Text } = Typography;

interface Props {
  method: {};
  icon: string;
  activePayment: string;
  setValue: UseFormSetValue<CheckoutFormValues>;
}

export const CachePaymentMethod = ({
  method,
  icon,
  activePayment,
  setValue,
}: Props) => {
  const { styles } = useStyles();

  return (
    <Button
      key={method.id}
      className={styles.paymentMethodBtn}
      variant="outlined"
      color={activePayment === method.handle ? "primary" : "default"}
      icon={
        <div className={styles.methodLogoWrapper}>
          <img className={styles.methodLogo} src={icon} alt="" />
        </div>
      }
      iconPosition="end"
      onClick={() => setValue("payment", method.handle)}
    >
      <Flex gap={12}>
        <Radio checked={activePayment === method.handle} />
        <Text className={styles.methodTitle} strong>
          {method.title}
        </Text>
      </Flex>
    </Button>
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

    paymentMethodBtn: css`
      display: flex;
      justify-content: space-between;

      height: 100%;

      padding: ${token.paddingSM}px ${token.paddingLG}px ${token.paddingSM}px
        ${token.paddingSM}px;
    `,

    methodTitle: css`
      ${mq.xxl} {
        font-size: ${token.fontSizeLG}px;
      }
    `,
  };
});
