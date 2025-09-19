"use client";

import { Flex, Progress as AntProgress, Typography } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import React from "react";

const { Text } = Typography;

interface Props {
  percent: number;
  description: boolean;
}

export default function Progress({ percent, description }: Props) {
  const { styles, theme } = useStyles();
  const t = useTranslations("BoxBuilder");

  return (
    <Flex vertical gap={4}>
      <div className={styles.progressContainer}>
        <AntProgress
          className={styles.progress}
          percent={percent}
          style={
            {
              "--ant-progress-remaining-color": theme.colorFillTertiary,
              "--ant-progress-line-border-radius": "4px",
            } as React.CSSProperties
          }
          percentPosition={{ type: "outer", align: "center" }}
          size={["100%", 28]}
          strokeColor={{
            direction: "to right",
            from: "#EAC9FF",
            to: "#BAE7FF",
          }}
          showInfo={false}
        />
        <Flex
          justify="space-around"
          align="center"
          className={styles.progressText}
        >
          <Text className={styles.progressTextItem}>
            {t("step2.size.small")}
          </Text>
          <Text className={styles.progressTextItem}>
            {t("step2.size.medium")}
          </Text>
          <Text className={styles.progressTextItem}>
            {t("step2.size.large")}
          </Text>
        </Flex>
      </div>
      {description && (
        <Text type="secondary">{t("step2.progress-description")}</Text>
      )}
    </Flex>
  );
}

const useStyles = createStyles(({ token, css }) => {
  return {
    progressContainer: css`
      position: relative;
      padding: ${token.paddingXXS}px;
      border: 1px solid ${token.colorPrimary};
      border-radius: ${token.borderRadius}px;
    `,
    progressText: css`
      width: 100%;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    `,
    progressTextItem: css`
      font-size: ${token.fontSizeSM}px;
    `,
    progress: css`
      display: block;
    `,
  };
});
