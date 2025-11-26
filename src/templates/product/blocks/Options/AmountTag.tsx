import type { model } from "@shopana/storefront-sdk";
import { Price } from "@src/ui-kit/Price/Price";
import { Tag } from "antd";

interface AmountTagProps {
  money: model.Money;
  borderless?: boolean;
}

export const AmountTag = ({ money, borderless }: AmountTagProps) => {
  return (
    <Tag
      color="blue"
      style={{
        backgroundColor: "transparent",
        fontWeight: "var(--font-weight-600)",
        border: borderless ? "none" : undefined,
        marginLeft: 4,
        padding: 0,
        fontSize: 13,
      }}
    >
      +<Price money={money} raw />
    </Tag>
  );
};
