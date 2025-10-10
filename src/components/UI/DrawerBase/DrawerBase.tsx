'use client';

import { DrawerProps, Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { ReactNode } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { useIsMobile } from '@src/hooks/useIsMobile';
import RootDrawer from '@src/components/UI/Drawer/RootDrawer';
import clsx from 'clsx';
import useToken from 'antd/es/theme/useToken';

const { Text } = Typography;

export interface DrawerBaseProps
  extends Omit<DrawerProps, 'children' | 'onClose' | 'open'> {
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
  /** Minimum height for the drawer content */
  minHeight?: string | number;
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
  showCloseButton: showCloseButtonProp,
  contentClassName,
  sectionStyles,
  placement,
  minHeight,
}: DrawerBaseProps) => {
  const { styles } = useStyles();
  const [, token] = useToken();
  const isMobile = useIsMobile();
  const showCloseButton = showCloseButtonProp || !isMobile;

  // Automatically determine placement and sizes for mobile devices
  const finalPlacement = placement || (isMobile ? 'bottom' : 'right');

  const renderHeader = () => {
    if (header) return header;

    if (!title && !showCloseButton && !headerExtra) return null;

    return (
      <Flex
        className={clsx(styles.header, sectionStyles?.header)}
        align="center"
        justify="space-between"
      >
        {title && <Text className={styles.title}>{title}</Text>}
        <Flex align="center" gap={8}>
          {headerExtra}
          {showCloseButton && (
            <Button
              icon={<RxCross2 size={24} color={token.colorIcon} />}
              type="text"
              className={styles.closeBtn}
              onClick={onClose}
            />
          )}
        </Flex>
      </Flex>
    );
  };

  const content = (
    <div
      className={clsx(styles.layout, contentClassName, 'ant-drawer-content')}
    >
      {renderHeader()}
      <div className={clsx(styles.content, sectionStyles?.content)}>
        {children}
      </div>
      {footer && (
        <div className={clsx(styles.footer, sectionStyles?.footer)}>
          {footer}
        </div>
      )}
    </div>
  );

  return (
    <RootDrawer
      open={open}
      onClose={onClose}
      direction={finalPlacement}
      minHeight={minHeight}
    >
      {content}
    </RootDrawer>
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
    background: ${token.colorBgBase};
    top: 0;
    z-index: 1;
    padding: ${token.paddingXS}px ${token.padding}px;
    flex-shrink: 0;
  `,
  title: css`
    font-size: ${token.fontSizeXL}px;
    font-weight: 600;
  `,
  closeBtn: css`
    &:hover {
      color: ${token.colorPrimary} !important;
    }
  `,
  content: css`
    flex: 1;
    padding: ${token.paddingXS}px ${token.padding}px 84px;
    height: 100%;
  `,
  footer: css`
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: ${token.padding}px;
  `,
}));
