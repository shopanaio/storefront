"use client";

import React from "react";
import { Button, Flex, Tag, Typography } from "antd";
import { createStyles, cx } from "antd-style";
import { RxCross2 } from "react-icons/rx";
import { useTranslations } from "next-intl";
import { mq } from "@src/components/Theme/breakpoints";

const { Text } = Typography;

interface Props {
  title: React.ReactNode;
  /** Close drawer without applying changes */
  onClose: () => void;
  /** Apply changes and close drawer */
  children?: React.ReactNode;
  footer?: {
    selectedLabel: string | string[];
    onConfirm: () => void;
  };
}

export const OptionDrawerLayout = ({
  title,
  onClose,
  children,
  footer,
}: Props) => {
  const t = useTranslations("Product");
  const { styles, theme } = useStyles();

  return (
    <div className={cx(styles.layout, "ant-drawer-content")}>
      <Flex className={styles.header} align="center" justify="space-between">
        {typeof title === "string" ? (
          <Text className={styles.title}>{title}</Text>
        ) : (
          title
        )}
        <Button
          size="large"
          icon={<RxCross2 size={24} color={theme.colorIcon} />}
          variant="link"
          color="default"
          onClick={onClose}
          style={{ padding: 0 }}
        />
      </Flex>
      <div className={cx(styles.content)}>{children}</div>
      {footer && (
        <Flex className={styles.footer} vertical>
          <Button type="primary" onClick={footer.onConfirm} size="large">
            {Array.isArray(footer.selectedLabel) ? (
              footer.selectedLabel.length > 0 ? (
                <>
                  {t("select")}{" "}
                  <Tag color="blue" style={{ marginLeft: 8, marginRight: 0 }}>
                    {footer.selectedLabel.length} items
                  </Tag>
                </>
              ) : (
                "Continue"
              )
            ) : (
              "Continue"
            )}
          </Button>
        </Flex>
      )}
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  layout: css`
    --thumb-size: 64px;

    display: flex;
    flex-direction: column;
    background: ${token.colorWhite};
    width: 100%;
    height: 100%;
    position: relative;
  `,
  header: css`
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: ${token.colorBgBase};
    padding: ${token.paddingSM}px ${token.padding}px;
    box-shadow: ${token.boxShadowTertiary};
  `,
  title: css`
    font-size: ${token.fontSizeLG}px;
    font-weight: var(--font-weight-600);
    ${mq.lg} {
      font-size: ${token.fontSizeLG}px;
    }
  `,
  content: css`
    padding: 0 ${token.padding}px;
    display: flex;
    flex-direction: column;
    padding: ${token.padding}px;
    flex: 1;
  `,
  footer: css`
    position: sticky;
    bottom: 0;
    padding: ${token.padding}px;
    background-color: ${token.colorBgBase};
  `,
}));
