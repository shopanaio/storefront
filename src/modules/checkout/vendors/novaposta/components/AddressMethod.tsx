import { Flex, Typography, Input } from "antd";
import { createStyles } from "antd-style";
import { MethodCollapsePanel } from "@src/modules/checkout/MethodCollapsePanel";
import { CityModal } from "./CityModal";
import { useTranslations } from "use-intl";
import { StreetModal } from "./StreetModal";
import {
  Control,
  Controller,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { CheckoutFormValues } from "@src/modules/checkout/Checkout";

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

export const AddressMethod = ({
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

        <div className={styles.addressDeliveryBox}>
          <Flex vertical gap={8}>
            <Text>{t("street")}</Text>
            <StreetModal
              street={watch("userStreet")}
              changeStreet={(street) => setValue("userStreet", street)}
              cityRef={watch("userCity")?.Ref}
            />
          </Flex>

          <Flex vertical gap={8}>
            <label htmlFor="user-house">{t("house")}</label>
            <Controller
              name="userHouse"
              control={control}
              render={({ field }) => (
                <Input {...field} id="user-house" size="large" />
              )}
            />
          </Flex>

          <Flex vertical gap={8}>
            <label htmlFor="user-apartment">{t("apartment")}</label>
            <Controller
              name="userApartment"
              control={control}
              render={({ field }) => (
                <Input {...field} id="user-apartment" size="large" />
              )}
            />
          </Flex>
        </div>
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
