import { Flex } from "antd";
import { Control, UseFormSetValue } from "react-hook-form";
import { CheckoutFormValues } from "../Checkout";
import { paymentMethodsMap } from "./paymentMethodsMap";

/** TODO: Use api type when it's available */
interface ApiPaymentMethod {
  code: string;
}

interface Props {
  methods: ApiPaymentMethod[];
  activePayment: string;
  shippingAsBilling: boolean;
  setValue: UseFormSetValue<CheckoutFormValues>;
  control: Control<CheckoutFormValues>;
}

export const PaymentMethods = ({
  methods,
  activePayment,
  shippingAsBilling,
  setValue,
  control,
}: Props) => {
  return (
    <Flex vertical gap={10}>
      {methods.map((method, index) => {
        const config = paymentMethodsMap[method.code];
        if (!config) return null;

        const { Component, icon } = config;

        return (
          <Component
            key={index}
            method={method}
            icon={icon}
            setValue={setValue}
            control={control}
            activePayment={activePayment}
            shippingAsBilling={shippingAsBilling}
          />
        );
      })}
    </Flex>
  );
};
