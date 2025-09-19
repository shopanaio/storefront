"use client";

import { Flex, Typography } from "antd";
import { ApiMoney } from "@codegen/schema-client";
import { OptionCard } from "@src/components/UI/OptionCard";
import { OptionImage } from "@src/components/UI/OptionImage";
import { AmountTag } from "@src/components/Product/Options/AmountTag";

const { Text } = Typography;

export interface OptionProductCardProps {
  src?: string;
  alt?: string;
  title: string;
  /** ApiMoney | number | string (amount) */
  price?: ApiMoney;
  /** Highlights the card as selected */
  selected?: boolean;
  /** Temporarily highlights the card, e.g., on external hover */
  hovered?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onMouseOver?: () => void;
  /** Type of control to render on the right (radio | checkbox). If omitted, no control will be shown */
  control?: "radio" | "checkbox";
  className?: string;
}

/**
 * Card-like option used inside OptionDrawer to display a product thumbnail,
 * its title and price, while still supporting the common «selected» state
 * (blue outline) and arbitrary overlay element (Radio/Checkbox).
 */
export const OptionProductCard = ({
  src,
  alt = "product thumbnail",
  title,
  price,
  selected = false,
  disabled,
  onClick,
  control,
  className,
}: OptionProductCardProps) => {
  return (
    <OptionCard
      className={className}
      selected={selected}
      disabled={disabled}
      onClick={onClick}
      control={control}
    >
      <Flex align="center" gap={8}>
        <OptionImage src={src} alt={alt} />
        <Flex vertical align="start">
          <Text
            ellipsis
            style={{
              textAlign: "left",
            }}
          >
            {title}
          </Text>
          {price && <AmountTag money={price} />}
        </Flex>
      </Flex>
    </OptionCard>
  );
};
