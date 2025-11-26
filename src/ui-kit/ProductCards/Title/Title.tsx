"use client";

import { Typography } from "antd";
import { createStyles } from "antd-style";
import React from "react";

import { multilineEllipsis } from "@src/ui-kit/utils/ellipsis";
import clsx from "clsx";

const { Text } = Typography;

export interface ProductCardTitleProps {
  children: React.ReactNode;
  rows?: number;
  size?: "default" | "large";
  className?: string;
  onClick?: () => void;
}

export const ProductCardTitle = ({
  children,
  rows = 2,
  size = "default",
  className,
  onClick,
}: ProductCardTitleProps) => {
  const { styles } = useStyles({ rows, size });
  return (
    <Text className={clsx(styles.title, className)} onClick={onClick}>
      {children}
    </Text>
  );
};

const useStyles = createStyles(
  (
    { token, css },
    { rows, size }: { rows: number; size: "default" | "large" }
  ) => ({
    title: css`
      ${multilineEllipsis(rows, 1.5)};
      font-weight: 400;

      text-align: left;
      font-size: ${size === "large" ? token.fontSizeLG : token.fontSize}px;
      line-height: 1.3;
      color: ${token.colorText};
    `,
  })
);
