import { Flex, Typography, Input } from "antd";
import { createStyles } from "antd-style";
import { MethodCollapsePanel } from "../MethodCollapsePanel";
import { WarehouseModal } from "./WarehouseModal";
import { CityModal } from "./CityModal";
import { useTranslations } from "use-intl";
import {
  Control,
  Controller,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { CheckoutFormValues } from "../Checkout";

import { PhoneInputField } from "@src/modules/checkout/PhoneInput";
import { ApiCheckoutDeliveryMethod } from "@codegen/schema-client";

const { Text } = Typography;

interface Props {
  method: ApiCheckoutDeliveryMethod;
  icon: string;
  activeShippingKey: string;
  setValue: UseFormSetValue<CheckoutFormValues>;
  control: Control<CheckoutFormValues>;
  watch: UseFormWatch<CheckoutFormValues>;
}

export const WarehouseMethod = ({
  method,
  icon,
  activeShippingKey,
  setValue,
  control,
  watch,
}: Props) => {
  const { styles } = useStyles();
  const t = useTranslations("Checkout");

  return (
    <MethodCollapsePanel
      key={method.code}
      value={method.code}
      title={method.code}
      // TODO: Prepare i18n title and description for the method
      buttonLabel={
        <div className={styles.methodLogoWrapper}>
          <img className={styles.methodLogo} src={icon} alt="" />
        </div>
      }
      activeKey={activeShippingKey}
      setActiveKey={(key) => setValue("activeShippingKey", key)}
    >
      <Flex vertical gap={12}>
        <Flex vertical gap={8}>
          <label htmlFor="user-name">{t("full-name")}</label>
          <Controller
            name="userName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="user-name"
                placeholder={t("full-name")}
                size="large"
              />
            )}
          />
        </Flex>
        <PhoneInputField
          control={control}
          name="userPhone"
          label={t("phone-number")}
          placeholder={t("phone")}
        />
        <Flex vertical gap={8}>
          <Text>{t("city")}</Text>
          <CityModal
            city={watch("userCity")}
            changeCity={(city) => setValue("userCity", city)}
          />
        </Flex>
        <Flex vertical gap={8}>
          <Text>{t("warehouse")}</Text>
          <WarehouseModal
            warehouse={watch("userWarehouse")}
            changeWarehouse={(warehouse) =>
              setValue("userWarehouse", warehouse)
            }
            cityName={watch("userCity")?.MainDescription}
          />
        </Flex>
      </Flex>
    </MethodCollapsePanel>
  );
};

const useStyles = createStyles(({ css, token }) => {
  return {
    addressDeliveryBox: css`
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: ${token.marginSM}px;
    `,
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
  };
});
