import { Controller, Control } from "react-hook-form";
import { Flex, Input, Typography } from "antd";
import { TbZoom } from "react-icons/tb";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { CheckoutFormValues } from "../Checkout";
import { useTranslations } from "next-intl";

const { Text } = Typography;

interface BillingAddressProps {
  control: Control<CheckoutFormValues>;
  shippingAsBilling: boolean;
}

export const BillingAddress = ({
  control,
  shippingAsBilling,
}: BillingAddressProps) => {
  const t = useTranslations("Checkout");

  return (
    <Flex vertical gap={12}>
      <Text strong>{t("billing-address")}</Text>

      <Controller
        name="billingCountry"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            placeholder={t("country-region")}
            disabled={shippingAsBilling}
          />
        )}
      />

      <Flex gap={8}>
        <Controller
          name="billingFirstName"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder={t("first-name-optional")}
              disabled={shippingAsBilling}
            />
          )}
        />
        <Controller
          name="billingLastName"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder={t("last-name")}
              disabled={shippingAsBilling}
            />
          )}
        />
      </Flex>

      <Controller
        name="billingCompany"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            placeholder={t("company-optional")}
            disabled={shippingAsBilling}
          />
        )}
      />

      <Controller
        name="billingAddress"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            placeholder={t("address")}
            suffix={<TbZoom />}
            disabled={shippingAsBilling}
          />
        )}
      />

      <Controller
        name="billingApartment"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            placeholder={t("apartment-suite-etc-optional")}
            disabled={shippingAsBilling}
          />
        )}
      />

      <Flex gap={8}>
        <Controller
          name="billingCity"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder={t("city")}
              disabled={shippingAsBilling}
            />
          )}
        />
        <Controller
          name="billingState"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder={t("state")}
              disabled={shippingAsBilling}
            />
          )}
        />
        <Controller
          name="billingZip"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder={t("zip-code")}
              disabled={shippingAsBilling}
            />
          )}
        />
      </Flex>

      <Controller
        name="billingPhone"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            placeholder={t("phone-optional")}
            suffix={<RxQuestionMarkCircled />}
            disabled={shippingAsBilling}
          />
        )}
      />
    </Flex>
  );
};
