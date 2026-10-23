'use client';

import { Button, Flex, Typography } from 'antd';
import type { ButtonProps, FlexProps } from 'antd';
import { createStyles } from 'antd-style';
import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';
import { LuX } from 'react-icons/lu';
import type { Breakpoint } from '../breakpoints';
import { useStorefrontUI } from '../StorefrontUIProvider';
import { useBreakpointDown } from '../useMediaQuery';
import { Sheet, type DrawerDirection } from './Sheet';

const { Text } = Typography;

/**
 * Parts of a drawer: `root` is its column (header, body, footer), `sheet` the vaul panel it
 * lies in.
 */
export type DrawerBasePart =
  | 'root'
  | 'sheet'
  | 'header'
  | 'title'
  | 'body'
  | 'footer'
  | 'close';

export interface DrawerBaseProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'children'
> {
  /** The dialog element (the vaul panel), as `id` and the `aria-*` and `data-*` props. */
  ref?: Ref<HTMLDivElement>;
  open: boolean;
  onClose: () => void;
  /** Called after the closing animation, when the content is gone. */
  onExited?: () => void;
  /** Title in the header; it names the drawer. */
  title?: ReactNode;
  /** Header of its own instead of the title and the close button; `DrawerBase.Title` names it. */
  header?: ReactNode;
  /** Next to the close button. */
  headerExtra?: ReactNode;
  /** Under the body, always in view. */
  footer?: ReactNode;
  children: ReactNode;
  /**
   * The close button of the header; shown on a side panel and hidden in a bottom sheet, which
   * closes by dragging it down or pressing the overlay.
   */
  showCloseButton?: boolean;
  /** Accessible name of the close button; the `close` text of `StorefrontUIProvider`. */
  closeLabel?: string;
  /** Side the drawer slides from; bottom in a sheet and right on a wider screen by default. */
  placement?: DrawerDirection;
  /** Below it the drawer is a bottom sheet; `lg` by default. */
  breakpoint?: Breakpoint;
  /** Width of a side panel. */
  width?: string | number;
  /**
   * Least height of the body in a bottom sheet, for content loaded as the buyer types (cities,
   * branches, streets), so the sheet does not jump with each answer. Without it the sheet is as
   * tall as its content.
   */
  minHeight?: string;
  /** Element the drawer is portalled into (see `Sheet`). */
  container?: HTMLElement | null;
  classNames?: Partial<Record<DrawerBasePart, string>>;
  styles?: Partial<Record<DrawerBasePart, CSSProperties>>;
}

interface DrawerBaseContextValue {
  onClose: () => void;
  closeLabel?: string;
  titleId: string;
  /** A title tells the drawer its id, so the drawer is named by it. */
  registerTitle: (id: string) => () => void;
  classNames?: Partial<Record<DrawerBasePart, string>>;
  styles?: Partial<Record<DrawerBasePart, CSSProperties>>;
}

const DrawerBaseContext = createContext<DrawerBaseContextValue | null>(null);

const useDrawerBaseContext = () => {
  const context = useContext(DrawerBaseContext);
  if (!context) {
    throw new Error('DrawerBase components must be used within DrawerBase');
  }
  return context;
};

/**
 * Drawer of the storefront (the cart, the checkout pickers, the sign-in): a header with the
 * title and the close button, the body and a footer always in view. A bottom sheet below
 * `breakpoint`, a right panel above it.
 */
export const DrawerBase = ({
  ref,
  open,
  onClose,
  onExited,
  title,
  header,
  headerExtra,
  footer,
  children,
  showCloseButton: showCloseButtonProp,
  closeLabel,
  placement,
  breakpoint = 'lg',
  width,
  minHeight,
  container,
  className,
  style,
  classNames,
  styles: partStyles,
  ...rest
}: DrawerBaseProps) => {
  const { styles, cx } = useStyles();
  const isSheet = useBreakpointDown(breakpoint);
  const showCloseButton = showCloseButtonProp ?? !isSheet;
  const titleId = useId();
  const [registeredTitle, setRegisteredTitle] = useState<string | null>(null);

  const finalPlacement = placement ?? (isSheet ? 'bottom' : 'right');
  const isHorizontal = finalPlacement === 'left' || finalPlacement === 'right';

  const context = useMemo<DrawerBaseContextValue>(
    () => ({
      onClose,
      closeLabel,
      titleId,
      registerTitle: (id) => {
        setRegisteredTitle(id);
        return () =>
          setRegisteredTitle((current) => (current === id ? null : current));
      },
      classNames,
      styles: partStyles,
    }),
    [onClose, closeLabel, titleId, classNames, partStyles]
  );

  const renderHeader = () => {
    if (header) return header;
    if (!title && !showCloseButton && !headerExtra) return null;
    return (
      <DrawerBaseHeader
        className={classNames?.header}
        style={partStyles?.header}
      >
        {title ? <DrawerBaseTitle>{title}</DrawerBaseTitle> : null}
        <Flex align="center" gap={8}>
          {headerExtra}
          {showCloseButton ? <DrawerBaseCloseButton /> : null}
        </Flex>
      </DrawerBaseHeader>
    );
  };

  return (
    <DrawerBaseContext.Provider value={context}>
      <Sheet
        {...rest}
        ref={ref}
        aria-labelledby={
          rest['aria-labelledby'] ?? registeredTitle ?? undefined
        }
        open={open}
        onClose={onClose}
        onExited={onExited}
        direction={finalPlacement}
        width={width}
        fullscreen={isSheet && isHorizontal}
        container={container}
        className={classNames?.sheet}
        style={partStyles?.sheet}
      >
        <div
          className={cx(styles.layout, classNames?.root, className)}
          style={{ ...partStyles?.root, ...style }}
        >
          {renderHeader()}
          <div
            className={cx(
              styles.body,
              !isHorizontal && styles.bodySheet,
              classNames?.body
            )}
            style={{
              ...(!isHorizontal && minHeight ? { minHeight } : undefined),
              ...partStyles?.body,
            }}
          >
            {children}
          </div>
          {footer ? (
            <div
              className={cx(styles.footer, classNames?.footer)}
              style={partStyles?.footer}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </Sheet>
    </DrawerBaseContext.Provider>
  );
};

/** Title of a header of its own: it names the drawer. */
const DrawerBaseTitle = ({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) => {
  const { styles, cx } = useStyles();
  const {
    titleId,
    registerTitle,
    classNames,
    styles: partStyles,
  } = useDrawerBaseContext();
  const finalId = id ?? titleId;
  useLayoutEffect(() => registerTitle(finalId), [registerTitle, finalId]);
  return (
    <Text
      id={finalId}
      className={cx(styles.title, classNames?.title)}
      style={partStyles?.title}
    >
      {children}
    </Text>
  );
};

const DrawerBaseHeader = ({
  children,
  className,
  ...props
}: { children: ReactNode } & FlexProps) => {
  const { styles, cx } = useStyles();
  return (
    <Flex
      align="center"
      justify="space-between"
      {...props}
      className={cx(styles.header, className)}
    >
      {children}
    </Flex>
  );
};

/** Closes the drawer; shown wherever it is placed, the bottom sheet as well. */
const DrawerBaseCloseButton = ({
  onClick,
  className,
  style,
  ...buttonProps
}: ButtonProps) => {
  const { styles, cx } = useStyles();
  const {
    onClose,
    closeLabel,
    classNames,
    styles: partStyles,
  } = useDrawerBaseContext();
  const { texts } = useStorefrontUI();
  return (
    <Button
      icon={<LuX size={24} color="currentColor" aria-hidden />}
      type="text"
      aria-label={closeLabel ?? texts.close}
      {...buttonProps}
      className={cx(styles.closeBtn, classNames?.close, className)}
      style={{ ...partStyles?.close, ...style }}
      onClick={(event) => {
        onClick?.(event);
        onClose();
      }}
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
    overflow: hidden;
  `,
  header: css`
    flex-shrink: 0;
    padding: calc(${token.paddingXS}px + var(--safe-area-top, 0px))
      calc(${token.paddingSM}px + var(--safe-area-right, 0px))
      ${token.paddingXS}px
      calc(${token.paddingSM}px + var(--safe-area-left, 0px));
    border-bottom: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgElevated};
  `,
  title: css`
    font-size: ${token.fontSizeXL}px;
    font-weight: 600;
  `,
  closeBtn: css`
    margin-right: -${token.marginXXS}px;

    &&&:not(:disabled):hover {
      color: ${token.colorPrimary};
    }
  `,
  // The body scrolls between the header and the footer, which stay in view.
  body: css`
    flex: 1 1 auto;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    padding: ${token.paddingXS}px
      calc(${token.paddingSM}px + var(--safe-area-right, 0px))
      calc(${token.padding}px + var(--safe-area-bottom, 0px))
      calc(${token.paddingSM}px + var(--safe-area-left, 0px));
  `,
  // A bottom sheet is as tall as its content, up to most of the screen.
  bodySheet: css`
    max-height: 80dvh;
  `,
  footer: css`
    flex-shrink: 0;
    padding: ${token.padding}px
      calc(${token.padding}px + var(--safe-area-right, 0px))
      calc(${token.padding}px + var(--safe-area-bottom, 0px))
      calc(${token.padding}px + var(--safe-area-left, 0px));
    background: ${token.colorBgElevated};
  `,
}));
