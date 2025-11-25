"use client";

import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";
import clsx from "clsx";

const { Text } = Typography;

interface Prop {
  title: string;
  children: React.ReactNode;
}

export default function SectionTitle({ title, children }: Prop) {
  const { styles } = useStyles();

  return (
    <div className={clsx("container")}>
      <Flex className={styles.container} justify="space-between" align="center">
        <Text strong className={styles.sectionTitle}>
          {title}
        </Text>
        {children}
      </Flex>
    </div>
  );
}

const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      display: flex;
      flex-wrap: wrap;
      gap: ${token.margin}px;
    `,

    sectionTitle: css`
      font-size: ${token.fontSizeHeading4}px;
      ${mq.lg} {
        font-size: ${token.fontSizeHeading3}px;
      }
    `,
  };
});
