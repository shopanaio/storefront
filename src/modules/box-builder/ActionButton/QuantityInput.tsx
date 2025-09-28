"use client";

import { QuantityInput } from "@src/components/Product/QuantityInput";
import { useBoxBuilderQuantityInputProps } from "@src/modules/box-builder/hooks/useBoxBuilderQuantityInputProps";

export interface BoxBuilderQuantityInputProps {
  productId: string;
  disabled?: boolean;
  size?: "small" | "middle" | "large";
  color?: "primary" | "default";
  loading?: boolean;
  className?: string;
  appearance: "card" | "activity";
}

export const BoxBuilderQuantityInput = ({
  productId,
  disabled,
  size = "middle",
  color = "primary",
  loading: loadingProps,
  className,
  appearance,
}: BoxBuilderQuantityInputProps) => {
  const { loading, onDecrement, onIncrement, value, onRemove } =
    useBoxBuilderQuantityInputProps({
      productId,
      disabled,
      loading: loadingProps,
      appearance,
    });

  return (
    <QuantityInput
      value={value}
      onIncrement={onIncrement}
      onDecrement={onDecrement}
      onRemove={onRemove}
      size={size}
      color={color}
      disabled={disabled}
      loading={loading}
      className={className}
      {...(appearance === "activity" ? { style: { height: 48 } } : {})}
    />
  );
};
