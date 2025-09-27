"use client";

import React from "react";
import { Drawer, Button, Flex, Typography } from "antd";
import { RxCross2 } from "react-icons/rx";
import { createStyles } from "antd-style";

const { Text } = Typography;

interface MobileStyleDrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when drawer is closed */
  onClose: () => void;
  /** Drawer title */
  title: string;
  /** Main content */
  children: React.ReactNode;
  /** Additional actions in header (e.g., Reset button) */
  headerActions?: React.ReactNode;
  /** Footer content (e.g., Apply button) */
  footer?: React.ReactNode;
  /** Drawer width, defaults to var(--components-drawer-width) */
  width?: string | number;
}

/**
 * Drawer component with MobileSearch-style layout and styling
 */
export const MobileStyleDrawer: React.FC<MobileStyleDrawerProps> = ({
  open,
  onClose,
  title,
  children,
  headerActions,
  footer,
  width = "var(--components-drawer-width)",
}) => {
  const { styles } = useStyles();

  const renderDrawer = () => (
    <div className={`${styles.container} ant-drawer-content`}>
      <Flex className={styles.header} vertical>
        <Flex align="center" justify="space-between">
          <Text className={styles.title}>{title}</Text>
          <Flex align="center" gap={10}>
            {headerActions}
            <Button
              className={styles.closeButton}
              icon={<RxCross2 size={24} />}
              type="text"
              onClick={onClose}
            />
          </Flex>
        </Flex>
      </Flex>
      <div className={styles.content}>
        {children}
        {footer}
      </div>
    </div>
  );

  return (
    <Drawer
      placement="right"
      onClose={onClose}
      open={open}
      closable={false}
      width={width}
      drawerRender={renderDrawer}
    />
  );
};

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    background: ${token.colorWhite};
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 0;
  `,
  header: css`
    width: 100%;
    padding: ${token.paddingSM}px;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: ${token.colorBgBase};
  `,
  content: css`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: ${token.margin}px;
    padding: 0 ${token.paddingSM}px ${token.padding}px;
    overflow-y: auto;
  `,
  title: css`
    font-size: ${token.fontSizeXL}px;
    font-weight: ${token.fontWeightStrong};
    margin: 0;
  `,
  closeButton: css`
    color: ${token.colorText};
  `,
}));
