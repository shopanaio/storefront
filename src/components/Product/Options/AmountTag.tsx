import { ApiMoney } from "@codegen/schema-client";
import { Price } from "@src/components/UI/Price/Price";
import { Tag } from "antd";

export const AmountTag = ({ money }: { money: ApiMoney }) => {
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
