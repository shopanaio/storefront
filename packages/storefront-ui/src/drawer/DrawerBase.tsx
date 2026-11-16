'use client';

import { Button, Flex, Typography } from 'antd';
import type { ButtonProps, FlexProps } from 'antd';
import { createStyles } from 'antd-style';
import {
  createContext,
  useContext,
  useEffect,
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
import {
  Sheet,
  type DrawerDirection,
  type SheetDetent,
  type SheetKeyboardHeight,
} from './Sheet';

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
   * The close button of the header; shown by default, in a bottom sheet too (round, as the
   * platforms' own sheets have it), though it also closes by dragging it down or pressing the
   * overlay.
   */
  showCloseButton?: boolean;
  /**
   * Whether dragging the sheet, pressing the overlay or Escape closes it; `true` by default.
   * Without it the drawer closes by its close button alone.
   */
  dismissible?: boolean;
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
  /** How tall the bottom sheet is over the keyboard (see `Sheet`); `full` by default. */
  keyboardHeight?: SheetKeyboardHeight;
  /** Where the bottom sheet stands as it opens (see `Sheet`); `content` by default. */
  detent?: SheetDetent;
  /** Element the drawer is portalled into (see `Sheet`). */
  container?: HTMLElement | null;
  classNames?: Partial<Record<DrawerBasePart, string>>;
  styles?: Partial<Record<DrawerBasePart, CSSProperties>>;
}

interface DrawerBaseContextValue {
  onClose: () => void;
  closeLabel?: string;
  /** A bottom sheet: its header as the platforms' own sheets have it. */
  isBottomSheet: boolean;
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
  dismissible,
  closeLabel,
  placement,
  breakpoint = 'lg',
  width,
  minHeight,
  keyboardHeight,
  detent,
  container,
  className,
  style,
  classNames,
  styles: partStyles,
  ...rest
}: DrawerBaseProps) => {
  const { styles, cx } = useStyles();
  const isSheet = useBreakpointDown(breakpoint);
  const showCloseButton = showCloseButtonProp ?? true;
  const titleId = useId();
  const [registeredTitle, setRegisteredTitle] = useState<string | null>(null);
  // The body scrolled from its top: a bottom sheet's header draws its line only then.
  const [scrolled, setScrolled] = useState(false);
  // The body's content is taller than it: it scrolls.
  const [bodyNode, setBodyNode] = useState<HTMLDivElement | null>(null);
  const [scrollable, setScrollable] = useState(false);
  useEffect(() => {
    if (!bodyNode) return;
    const measure = () => {
      setScrollable(bodyNode.scrollHeight > bodyNode.clientHeight + 1);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(bodyNode);
    for (const child of Array.from(bodyNode.children)) observer.observe(child);
    const mutations = new MutationObserver(() => {
      observer.disconnect();
      observer.observe(bodyNode);
      for (const child of Array.from(bodyNode.children))
        observer.observe(child);
      measure();
    });
    mutations.observe(bodyNode, { childList: true });
    measure();
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [bodyNode]);


  const finalPlacement = placement ?? (isSheet ? 'bottom' : 'right');
  const isHorizontal = finalPlacement === 'left' || finalPlacement === 'right';
  const isBottomSheet = finalPlacement === 'bottom';

  const context = useMemo<DrawerBaseContextValue>(
    () => ({
      onClose,
      closeLabel,
      isBottomSheet,
      titleId,
      registerTitle: (id) => {
        setRegisteredTitle(id);
        return () =>
          setRegisteredTitle((current) => (current === id ? null : current));
      },
      classNames,
      styles: partStyles,
    }),
    [onClose, closeLabel, isBottomSheet, titleId, classNames, partStyles]
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
        <Flex align="center" gap={8} className={styles.actions}>
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
        dismissible={dismissible}
        direction={finalPlacement}
        width={width}
        fullscreen={isSheet && isHorizontal}
        keyboardHeight={keyboardHeight}
        detent={detent}
        container={container}
        className={classNames?.sheet}
        style={partStyles?.sheet}
      >
        <div
          className={cx(
            styles.layout,
            isBottomSheet && styles.bottomSheet,
            classNames?.root,
            className
          )}
          style={{ ...partStyles?.root, ...style }}
          data-scrolled={isBottomSheet && scrolled ? '' : undefined}
        >
          {renderHeader()}
          <div
            ref={setBodyNode}
            className={cx(styles.body, classNames?.body)}
            data-scrollable={scrollable ? '' : undefined}
            data-drawer-body=""
            // The sheet is dragged by its header alone: a drag here scrolls or does nothing.
            data-vaul-no-drag=""
            onScroll={
              isBottomSheet
                ? (event) => setScrolled(event.currentTarget.scrollTop > 0)
                : undefined
            }
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
              data-vaul-no-drag=""
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
      data-drawer-title=""
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
      data-drawer-header=""
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
    isBottomSheet,
    classNames,
    styles: partStyles,
  } = useDrawerBaseContext();
  const { texts } = useStorefrontUI();
  return (
    <Button
      icon={
        <LuX size={isBottomSheet ? 20 : 24} color="currentColor" aria-hidden />
      }
      type="text"
      shape={isBottomSheet ? 'circle' : undefined}
      aria-label={closeLabel ?? texts.close}
      {...buttonProps}
      className={cx(
        styles.closeBtn,
        isBottomSheet && styles.closeRound,
        classNames?.close,
        className
      )}
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

/**
 * A row of a bottom sheet's header with its title (`data-drawer-title`: DrawerBase.Title, or
 * the element that holds the title with what goes with it) and its actions after it: the
 * header itself, or a row of it marked `data-drawer-title-row` (a header with a search under
 * its title).
 */
const TITLE_ROW =
  '& :is([data-drawer-header]:has(> [data-drawer-title]), [data-drawer-title-row])';

const useStyles = createStyles(({ css, token }) => ({
  layout: css`
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    background-color: ${token.colorBgElevated};
    overflow: hidden;
  `,
  header: css`
    flex-shrink: 0;
    padding: max(${token.paddingXS}px, var(--safe-area-top, 0px))
      max(${token.paddingSM}px, var(--safe-area-right, 0px))
      ${token.paddingXS}px
      max(${token.paddingSM}px, var(--safe-area-left, 0px));
    border-bottom: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgElevated};
  `,
  title: css`
    font-size: ${token.fontSizeXL}px;
    font-weight: 600;
  `,
  // A bottom sheet's header draws its line only once the body is scrolled under it, as the
  // platforms' own sheets do. On iOS (its WebKit alone knows -webkit-touch-callout) the title
  // stands in the middle at 17px, as in iOS's own sheets, its actions on the right and as much
  // room on the left; elsewhere it starts the header, as Android's (Material 3).
  bottomSheet: css`
    & > [data-drawer-header] {
      border-bottom-color: transparent;
      transition: border-color ${token.motionDurationMid} ease;
    }

    &[data-scrolled] > [data-drawer-header] {
      border-bottom-color: ${token.colorBorderSecondary};
    }

    @supports (-webkit-touch-callout: none) {
      ${TITLE_ROW} {
        display: grid;
        grid-template-columns: 1fr minmax(0, auto) 1fr;
        align-items: center;
      }

      /* A long title wraps, never cut. */
      ${TITLE_ROW} > [data-drawer-title] {
        grid-column: 2;
        justify-content: center;
        text-align: center;
      }

      ${TITLE_ROW} > :last-child:not([data-drawer-title]) {
        grid-column: 3;
        justify-self: end;
      }

      & [data-drawer-header] [data-drawer-title] {
        font-size: 17px;
      }
    }
  `,
  // On the right of the header, with a title before them or none.
  actions: css`
    margin-inline-start: auto;
  `,
  closeBtn: css`
    margin-right: -${token.marginXXS}px;

    &&&:not(:disabled):hover {
      color: ${token.colorPrimary};
    }
  `,
  // The round close button of the platforms' own sheets, on a soft fill.
  closeRound: css`
    &&& {
      margin-right: 0;
      color: ${token.colorTextSecondary};
      background: ${token.colorFillTertiary};
    }

    &&&:not(:disabled):hover {
      color: ${token.colorText};
      background: ${token.colorFillSecondary};
    }
  `,
  // The body scrolls between the header and the footer, which stay in view.
  body: css`
    flex: 1 1 auto;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    padding: ${token.paddingXS}px
      max(${token.paddingSM}px, var(--safe-area-right, 0px))
      max(${token.padding}px, var(--safe-area-bottom, 0px))
      max(${token.paddingSM}px, var(--safe-area-left, 0px));

    /* The sheet takes no touch gestures of the browser (vaul's touch-action: none): a body
       taller than its room scrolls them itself, its end not passing the scroll on. A body
       that fits leaves the sheet to be dragged from it. */
    &[data-scrollable] {
      touch-action: pan-y;
      overscroll-behavior: contain;
    }
  `,
  footer: css`
    flex-shrink: 0;
    padding: ${token.padding}px
      max(${token.padding}px, var(--safe-area-right, 0px))
      max(${token.padding}px, var(--safe-area-bottom, 0px))
      max(${token.padding}px, var(--safe-area-left, 0px));
    background: ${token.colorBgElevated};
  `,
}));
