"use client";

import { Drawer, DrawerProps, Button, Flex, Typography } from "antd";
import { createStyles, cx } from "antd-style";
import { ReactNode } from "react";
import { RxCross2 } from "react-icons/rx";
import { useIsMobile } from "@src/hooks/useIsMobile";

const { Text } = Typography;

export interface DrawerBaseProps
  extends Omit<DrawerProps, "children" | "onClose" | "open"> {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when drawer is closed */
  onClose: () => void;
  /** Drawer title */
  title?: ReactNode;
  /** Custom header content (overrides title) */
  header?: ReactNode;
  /** Extra content to display in header next to close button */
  headerExtra?: ReactNode;
  /** Footer content */
  footer?: ReactNode;
  /** Main content */
  children: ReactNode;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Additional class for content wrapper */
  contentClassName?: string;
  /** Custom styles for different sections */
  sectionStyles?: {
    header?: string;
    content?: string;
    footer?: string;
  };
}

/**
 * Base Drawer component with common structure and styles.
 * Automatically adapts to mobile devices.
 */
export const DrawerBase = ({
  open,
  onClose,
  title,
  header,
  headerExtra,
  footer,
  children,
  showCloseButton = true,
  contentClassName,
  sectionStyles,
  placement,
  height,
  width,
  ...drawerProps
}: DrawerBaseProps) => {
  const { styles } = useStyles();
  const isMobile = useIsMobile();

  // Automatically determine placement and sizes for mobile devices
  const finalPlacement = placement || (isMobile ? "bottom" : "right");
  const finalHeight = height || (isMobile ? "60vh" : undefined);
  const finalWidth =
    width || (!isMobile ? "var(--components-drawer-width)" : undefined);

  const renderHeader = () => {
    if (header) return header;

    if (!title && !showCloseButton && !headerExtra) return null;

    return (
      <Flex
        className={cx(styles.header, sectionStyles?.header)}
        align="center"
        justify="space-between"
      >
        {title && <Text className={styles.title}>{title}</Text>}
        <Flex align="center" gap={8}>
          {headerExtra}
          {showCloseButton && (
            <Button
              icon={<RxCross2 size={24} />}
              type="text"
              className={styles.closeBtn}
              onClick={onClose}
            />
          )}
        </Flex>
      </Flex>
    );
  };

  const renderContent = () => (
    <div className={cx(styles.layout, contentClassName, "ant-drawer-content")}>
      {renderHeader()}
      <div className={cx(styles.content, sectionStyles?.content)}>
        {children}
      </div>
      {footer && (
        <div className={cx(styles.footer, sectionStyles?.footer)}>{footer}</div>
      )}
    </div>
  );

  return (
    <Drawer
      placement={finalPlacement}
      height={finalHeight}
      width={finalWidth}
      open={open}
      onClose={onClose}
      closable={false}
      drawerRender={renderContent}
      {...drawerProps}
    />
  );
};

const useStyles = createStyles(({ css, token }) => ({
  layout: css`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${token.colorBgBase};
    overflow-y: auto;
    overflow-x: hidden;
  `,
  header: css`
    position: sticky;
    top: 0;
    z-index: 1;
    padding: ${token.padding}px;
    background-color: ${token.colorBgBase};
    /* padding: ${token.padding}px; */
    flex-shrink: 0;
  `,
  title: css`
    font-size: ${token.fontSizeLG}px;
    font-weight: 600;
  `,
  closeBtn: css`
    &:hover {
      color: ${token.colorPrimary} !important;
    }
  `,
  content: css`
    flex: 1;
    padding: 0 ${token.padding}px;
  `,
  footer: css`
    position: sticky;
    bottom: 0;
    margin-top: auto;
    padding: ${token.padding}px;
    flex-shrink: 0;
  `,
}));
