"use client";

import { Badge, Button, Flex, Typography } from "antd";
import { createStyles } from "antd-style";

interface Props {
  title: string;
  productsCount: number;
}

export const ProductDescription = ({ title, productsCount }: Props) => {
  const { styles } = useStyles();

  return null; // TODO: Implement product description component
};

const useStyles = createStyles(({ css, token }) => ({
  titleSection: css`
  `,
}));
