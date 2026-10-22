'use client';

import { Button, Flex, Typography } from 'antd';
import type { ButtonProps, FlexProps } from 'antd';
import { createStyles } from 'antd-style';
import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useMedia } from 'react-use';
import { LuX } from 'react-icons/lu';
import clsx from 'clsx';
import { Vaul, type DrawerDirection } from './drawer/Vaul';
import { breakpoints, mq } from './breakpoints';

const { Text } = Typography;

/** Same breakpoint as the theme's `useIsMobile`: the cart drawer turns into a bottom sheet below `lg`. */
const MOBILE_QUERY = `(max-width: ${breakpoints.lg - 0.05}px)`;

const useIsDrawerMobile = () => useMedia(MOBILE_QUERY, false);

export interface DrawerBaseProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when drawer is closed */
  onClose: () => void;
  /** Callback after the closing animation is finished */
  onExited?: () => void;
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
  /** Side the drawer slides from; bottom on mobile and right on desktop by default */
  placement?: DrawerDirection;
  /** Drawer width for horizontal placements */
  width?: string | number;
  /**
   * Least height of the content in a bottom sheet, for content loaded as the buyer types (cities,
   * branches, streets), so the sheet does not jump with each answer. Without it the sheet is as
   * tall as its content.
   */
  minHeight?: string;
  'aria-labelledby'?: string;
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
 * Drawer of the checkout: the same vaul drawer, layout and styles as the cart drawer of the
 * theme (brand-bite-crunch `ui-kit/DrawerBase`). Bottom sheet on mobile, right panel on desktop.
 */
export const DrawerBase = ({
  open,
  onClose,
  onExited,
  title,
  header,
  headerExtra,
  footer,
  children,
  showCloseButton: showCloseButtonProp,
  contentClassName,
  sectionStyles,
  placement,
  width,
  minHeight,
  'aria-labelledby': ariaLabelledBy,
}: DrawerBaseProps) => {
  const { styles, cx } = useStyles();
  const isMobile = useIsDrawerMobile();
  const showCloseButton = showCloseButtonProp || !isMobile;

  const finalPlacement = placement || (isMobile ? 'bottom' : 'right');
  const isHorizontal = finalPlacement === 'left' || finalPlacement === 'right';

  const renderHeader = () => {
    if (header) return header;

    if (!title && !showCloseButton && !headerExtra) return null;

    return (
      <DrawerBaseHeader className={sectionStyles?.header}>
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

      <div
        className={cx(styles.content, footer ? styles.withFooter : undefined, sectionStyles?.content)}
        style={isMobile && !isHorizontal && minHeight ? { minHeight } : undefined}
      >
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
      <Vaul
        open={open}
        onClose={onClose}
        onExited={onExited}
        dismissible
        direction={finalPlacement}
        width={width}
        isFullscreen={isMobile && isHorizontal}
        aria-labelledby={ariaLabelledBy}
      >
        {content}
      </Vaul>
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
  const { onClose } = useDrawerBaseContext();
  const isMobile = useIsDrawerMobile();

  const handleClick = (
    event: Parameters<NonNullable<ButtonProps['onClick']>>[0]
  ) => {
    onClick?.(event);
    onClose();
  };

  // On mobile the sheet is closed by dragging it down or tapping the overlay, as the cart drawer.
  if (isMobile) return null;

  return (
    <Button
      icon={<LuX size={24} color="currentColor" />}
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
    padding: calc(8px + var(--safe-area-top, 0px))
      calc(${token.paddingSM}px + var(--safe-area-right, 0px)) 8px
      calc(${token.paddingSM}px + var(--safe-area-left, 0px));
    border-bottom: 1px solid ${token.colorBorderSecondary};
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
    padding: ${token.paddingXS}px
      calc(${token.paddingSM}px + var(--safe-area-right, 0px))
      calc(${token.padding}px + var(--safe-area-bottom, 0px))
      calc(${token.paddingSM}px + var(--safe-area-left, 0px));
    height: 100%;
    max-height: 80dvh;

    ${mq.lg} {
      max-height: unset;
    }
  `,
  // Room for the footer, which lies over the end of the content.
  withFooter: css`
    padding-bottom: calc(84px + var(--safe-area-bottom, 0px));
  `,
  footer: css`
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: ${token.padding}px
      calc(${token.padding}px + var(--safe-area-right, 0px))
      calc(${token.padding}px + var(--safe-area-bottom, 0px))
      calc(${token.padding}px + var(--safe-area-left, 0px));
  `,
}));
