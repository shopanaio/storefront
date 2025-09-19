"use client";

import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";

const { Text } = Typography;

interface Prop {
  title: string;
  children: React.ReactNode;
}

export default function SectionTitle({ title, children }: Prop) {
  const { styles } = useStyles();

  return (
    <div className={styles.sectionTitleContainer}>
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
    sectionTitleContainer: css`
      padding: 0 ${token.padding}px;
    `,

    container: css`
      display: flex;
      flex-wrap: wrap;

      gap: ${token.margin}px;
      width: 100%;

      ${mq.xl} {
        margin-right: auto;
        margin-left: auto;

        max-width: 1280px;
      }

      ${mq.xxl} {
        padding: 0;
        max-width: 1400px;
      }
    `,

    sectionTitle: css`
      font-size: 18px;

      ${mq.lg} {
        font-size: 24px;
      }
    `,
  };
});
