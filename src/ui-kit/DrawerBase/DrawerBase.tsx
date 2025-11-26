'use client';

import { Button, Flex, Typography } from 'antd';
import type { ButtonProps, DrawerProps, FlexProps } from 'antd';
import { createStyles } from 'antd-style';
import { ReactNode, createContext, useContext, useMemo } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { useIsMobile } from '@src/hooks/useIsMobile';
import RootDrawer, { DrawerEngine } from '@src/ui-kit/Drawer/RootDrawer';
import clsx from 'clsx';
import useToken from 'antd/es/theme/useToken';
import { mq } from '@src/ui-kit/Theme/breakpoints';

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
  engine?: DrawerEngine;
}

type DrawerBaseContextValue = {
  onClose: () => void;
};

const DrawerBaseContext = createContext<DrawerBaseContextValue | null>(null);

const useDrawerBaseContext = () => {
  const context = useContext(DrawerBaseContext);

  if (!context) {
    throw new Error('DrawerBase components must be used within DrawerBase');
  }

  return context;
};

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
  engine,
}: DrawerBaseProps) => {
  const { styles } = useStyles();
  const isMobile = useIsMobile();
  const showCloseButton = showCloseButtonProp || !isMobile;

  // Automatically determine placement and sizes for mobile devices
  const finalPlacement = placement || (isMobile ? 'bottom' : 'right');
  const isHorizontal = ['left', 'right'].includes(finalPlacement);

  const renderHeader = () => {
    if (header) return header;

    if (!title && !showCloseButton && !headerExtra) return null;

    return (
      <DrawerBaseHeader>
        {title && <Text className={styles.title}>{title}</Text>}
        <Flex align="center" gap={8}>
          {headerExtra}
          {showCloseButton && <DrawerBaseCloseButton />}
        </Flex>
      </DrawerBaseHeader>
    );
  };

  const content = (
    <div className={clsx(styles.layout, contentClassName)}>
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
    <DrawerBaseContext.Provider value={useMemo(() => ({ onClose }), [onClose])}>
      <RootDrawer
        open={open}
        onClose={onClose}
        direction={finalPlacement}
        minHeight={minHeight}
        engine={engine}
        isFullscreen={isMobile && isHorizontal}
      >
        {content}
      </RootDrawer>
    </DrawerBaseContext.Provider>
  );
};

const DrawerBaseTitle = ({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) => {
  const { styles } = useStyles();

  return (
    <Text id={id} className={styles.title}>
      {children}
    </Text>
  );
};

const DrawerBaseHeader = ({
  children,
  ...props
}: { children: ReactNode } & FlexProps) => {
  const { styles } = useStyles();

  return (
    <Flex
      align="center"
      justify="space-between"
      {...props}
      className={clsx(styles.header, props.className)}
    >
      {children}
    </Flex>
  );
};

const DrawerBaseCloseButton = ({ onClick, ...buttonProps }: ButtonProps) => {
  const { styles } = useStyles();
  const [, token] = useToken();
  const { onClose } = useDrawerBaseContext();

  const handleClick = (
    event: Parameters<NonNullable<ButtonProps['onClick']>>[0]
  ) => {
    onClick?.(event);
    onClose();
  };

  return (
    <Button
      icon={<RxCross2 size={24} color={token.colorIcon} />}
      type="text"
      className={styles.closeBtn}
      onClick={handleClick}
      {...buttonProps}
    />
  );
};

DrawerBase.Title = DrawerBaseTitle;
DrawerBase.Header = DrawerBaseHeader;
DrawerBase.CloseButton = DrawerBaseCloseButton;

const useStyles = createStyles(({ css, token }) => ({
  layout: css`
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: ${token.colorBgElevated};
    overflow-y: auto;
    overflow-x: hidden;
  `,
  header: css`
    position: sticky;
    background: ${token.colorBgElevated};
    top: 0;
    z-index: 1;
    padding: ${token.paddingSM}px;
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
    margin-right: -${token.marginXXS}px;
  `,
  content: css`
    flex: 1;
    padding: ${token.paddingXS}px ${token.paddingSM}px 84px;
    height: 100%;
    max-height: 80dvh;

    ${mq.lg} {
      max-height: unset;
    }
  `,
  footer: css`
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: ${token.padding}px;
  `,
}));
