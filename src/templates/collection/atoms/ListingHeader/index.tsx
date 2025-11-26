"use client";

import React from "react";
import { Typography } from "antd";
import { createStyles } from "antd-style";
import { mq } from "@src/ui-kit/Theme/breakpoints";

const { Text } = Typography;

interface ListingHeaderProps {
  title: string;
}

export const ListingHeader: React.FC<ListingHeaderProps> = ({ title }) => {
  const { styles } = useStyles();

  return (
    <Text strong className={styles.pageTitle}>
      {title}
    </Text>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  pageTitle: css`
    display: inline-block;
    width: max-content;
    font-size: ${token.fontSizeHeading4}px;
    ${mq.lg} {
      font-size: ${token.fontSizeHeading3}px;
    }
  `,
}));
