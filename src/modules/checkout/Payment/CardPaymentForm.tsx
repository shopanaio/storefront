import { Flex, Input } from "antd";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { useTranslations } from "next-intl";
import { CheckoutFormValues } from "../Checkout";
import { Control, Controller } from "react-hook-form";
import { PatternFormat } from "react-number-format";

interface Prop {
  control: Control<CheckoutFormValues>;
}

export const CardPaymentForm = ({ control }: Prop) => {
  const t = useTranslations("Checkout");

  return (
    <Flex vertical gap={12}>
      <Controller
        name="cardNumber"
        control={control}
        render={({ field }) => (
          <PatternFormat
            {...field}
            format="#### #### #### ####"
            customInput={Input}
            placeholder={t("card-number")}
          />
        )}
      />

      <Flex gap={8}>
        <Controller
          name="expirationDate"
          control={control}
          render={({ field }) => (
            <PatternFormat
              {...field}
              format="(##/##)"
              customInput={Input}
              placeholder={t("expiration-date")}
            />
          )}
        />
        <Controller
          name="cvv"
          control={control}
          render={({ field }) => (
            <PatternFormat
              {...field}
              format="###"
              type="password"
              customInput={Input}
              placeholder={t("security-code")}
              suffix={<RxQuestionMarkCircled />}
            />
          )}
        />
      </Flex>
    </Flex>
  );
};
