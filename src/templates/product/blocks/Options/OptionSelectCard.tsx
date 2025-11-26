"use client";

import { Flex, Typography } from "antd";
import { AmountTag } from "./AmountTag";
import { UiOptionValue } from "@src/hooks/useFlattenProductOptions";
import type { model } from "@shopana/storefront-sdk";
import { OptionImage } from "@src/ui-kit/OptionImage";
import { OptionCard } from "@src/ui-kit/OptionCard";

const { Text } = Typography;

interface OptionSelectCardProps {
  title: string;
  selectedValues: UiOptionValue | UiOptionValue[] | null;
  cover?: model.Media | null;
  onClick: () => void;
}

export const OptionSelectCard = ({
  title,
  selectedValues,
  cover,
  onClick,
}: OptionSelectCardProps) => {
  return (
    <OptionCard onClick={onClick} control="chevron">
      <Flex align="center" gap={8}>
        {cover && (
          <OptionImage
            src={cover.url}
            alt={
              Array.isArray(selectedValues)
                ? selectedValues.map((v) => v.title).join(", ")
                : selectedValues?.title || title
            }
            size="custom"
          />
        )}
        <Flex vertical>
          <Text style={{ display: "flex", gap: 8 }}>{title}</Text>
          {selectedValues &&
            (Array.isArray(selectedValues)
              ? selectedValues.length > 0
              : selectedValues) && (
              <Flex
                vertical={
                  Array.isArray(selectedValues) && selectedValues.length > 1
                }
              >
                {Array.isArray(selectedValues) ? (
                  selectedValues.map((v, idx) => (
                    <Text
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: 700,
                        flexWrap: "wrap",
                      }}
                    >
                      {v.title}
                      {v.amount && <AmountTag money={v.amount} />}
                    </Text>
                  ))
                ) : (
                  <Text
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 700,
                      flexWrap: "wrap",
                    }}
                  >
                    {selectedValues.title}
                    {selectedValues.amount && (
                      <AmountTag money={selectedValues.amount} />
                    )}
                  </Text>
                )}
              </Flex>
            )}
        </Flex>
      </Flex>
    </OptionCard>
  );
};
