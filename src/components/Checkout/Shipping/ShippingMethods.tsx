import { Flex } from "antd";
import { ApiShippingMethod } from "@codegen/schema-client";
import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { CheckoutFormValues } from "../Checkout";
import { shippingMethodComponents } from "./shippingMethodsMap";

interface Props {
  methods: ApiShippingMethod[];
  activeShippingKey: string;
  setValue: UseFormSetValue<CheckoutFormValues>;
  control: Control<CheckoutFormValues>;
  watch: UseFormWatch<CheckoutFormValues>;
}

export const ShippingMethods = ({
  methods,
  activeShippingKey,
  setValue,
  control,
  watch,
}: Props) => {
  return (
    <Flex vertical gap={10}>
      {methods.map((method) => {
        const config = shippingMethodComponents[method.handle];
        if (!config) return null;

        const { Component, icon } = config;

        return (
          <Component
            key={method.id}
            method={method}
            icon={icon}
            activeShippingKey={activeShippingKey}
            setValue={setValue}
            control={control}
            watch={watch}
          />
        );
      })}
    </Flex>
  );
};
