import { Flex } from "antd";
import { ApiPaymentMethod } from "@codegen/schema-client";
import { Control, UseFormSetValue } from "react-hook-form";
import { CheckoutFormValues } from "../Checkout";
import { paymentMethodsMap } from "./paymentMethodsMap";

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
        const config = paymentMethodsMap[method.handle];
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
