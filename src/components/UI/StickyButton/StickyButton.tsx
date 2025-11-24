"use client";

import React from "react";
import { Button, ButtonProps, Flex } from "antd";
import useToken from "antd/es/theme/useToken";
import { TbArrowRight } from "react-icons/tb";
import { Price } from "@src/components/UI/Price/Price";
import type { model } from "@shopana/storefront-sdk";

/**
 * Sticky button component with white box-shadow border
 * Designed for use in drawers and modal footers
 */
export interface StickyButtonProps extends Omit<ButtonProps, 'style'> {
  /** Main label content */
  label?: React.ReactNode;
  /** Optional money amount to display */
  money?: model.Money;
  /** Divider between label and money */
  divider?: string | null;
  /** Show right arrow icon */
  rightArrow?: boolean;
  /** Additional styles */
  style?: React.CSSProperties;
}

export const StickyButton: React.FC<StickyButtonProps> = ({
  label,
  money,
  divider = " • ",
  rightArrow = false,
  children,
  type = "primary",
  size = "large",
  ...buttonProps
}) => {
  const [, token] = useToken();

  const content = label || children;
  const showContent = content || money;

  return (
    <Button
      type={type}
      size={size}
      block
      style={{
        boxShadow: `0 0 1px 1px ${token.colorBgBase}`,
        height: 48,
        position: "relative",
        ...buttonProps.style,
      }}
      {...buttonProps}
    >
      {showContent ? (
        <Flex align="center" justify="center">
          {content}
          {divider && money && divider}
          {money && <Price money={money} raw />}
          {rightArrow && (
            <TbArrowRight
              size={24}
              color="currentColor"
              style={{ position: "absolute", right: token.paddingSM }}
            />
          )}
        </Flex>
      ) : null}
    </Button>
  );
};
