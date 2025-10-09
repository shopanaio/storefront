"use client";

import React from "react";
import { Tag } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import { DrawerBase } from "@src/components/UI/DrawerBase/DrawerBase";
import { StickyButton } from "@src/components/UI/StickyButton/StickyButton";

interface Props {
  /** Whether the drawer is open */
  open: boolean;
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
  open,
  title,
  onClose,
  children,
  footer,
}: Props) => {
  const t = useTranslations("Product");
  const { styles } = useStyles();

  const renderFooter = () => {
    if (!footer) return undefined;

    return (
      <StickyButton onClick={footer.onConfirm}>
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
      </StickyButton>
    );
  };

  return (
    <DrawerBase
      open={open}
      onClose={onClose}
      title={title}
      // showCloseButton
      footer={renderFooter()}
      contentClassName={styles.content}
    >
      {children}
    </DrawerBase>
  );
};

const useStyles = createStyles(({ css }) => ({
  content: css`
    --thumb-size: 64px;

    display: flex;
    flex-direction: column;
  `,
}));
