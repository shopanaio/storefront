"use client";

import React from "react";
import { Badge, Flex, Typography } from "antd";
import { createStyles } from "antd-style";

interface ListingHeaderProps {
  title: string;
}

export const ListingHeader: React.FC<ListingHeaderProps> = ({ title }) => {
  const { styles } = useStyles();

  return (
    <Flex className={styles.titleWrapper}>
      <Typography.Text className={styles.pageTitle}>{title}</Typography.Text>
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  titleWrapper: css`
    width: max-content;
  `,
  pageTitle: css`
    font-size: ${token.fontSizeHeading3}px;
  `,
}));
