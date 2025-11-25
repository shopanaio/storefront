import type { model } from "@shopana/storefront-sdk";
import { Price } from "@src/components/UI/Price/Price";
import { Tag } from "antd";

export const AmountTag = ({ money }: { money: model.Money }) => {
  return (
    <Tag
      color="blue"
      style={{
        backgroundColor: "transparent",
        fontWeight: "var(--font-weight-600)",
        border: "none",
        marginLeft: 4,
        padding: 0,
        fontSize: 13,
      }}
    >
      +<Price money={money} raw />
    </Tag>
  );
};
