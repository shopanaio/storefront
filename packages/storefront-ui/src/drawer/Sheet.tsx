'use client';

import { theme } from 'antd';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  AnimationEvent,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  Ref,
} from 'react';
import { Content, Drawer, NestedRoot, Overlay, Portal, Root } from 'vaul';
import AnimateHeight, { type Height } from 'react-animate-height';
import { useStorefrontUI } from '../StorefrontUIProvider';
import { VisuallyHidden } from '../VisuallyHidden';
import { DrawerLayerContext, useDrawerLayer, type DrawerLayer } from './layer';
import { useStyles } from './styles';

export type DrawerDirection = 'top' | 'bottom' | 'left' | 'right';

/** Parts of a sheet: the content panel, the overlay under it, the drag handle, the body. */
export type SheetPart = 'root' | 'overlay' | 'handle' | 'body';

export interface SheetProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'children' | 'onAnimationEnd'
> {
  ref?: Ref<HTMLDivElement>;
  open: boolean;
  onClose: () => void;
  /** Called after the closing animation, when the content is gone. */
  onExited?: () => void;
  /** Whether dragging the sheet or pressing the overlay closes it; `true` by default. */
  dismissible?: boolean;
  children: ReactNode;
  /** Side the sheet slides from; `bottom` by default. */
  direction?: DrawerDirection;
  /** A side panel over the whole screen, without its offset and radius. */
  fullscreen?: boolean;
  /** Width of a side panel; `--components-drawer-width` or 500px by default. */
  width?: string | number;
  /**
   * Accessible name of the sheet when nothing in it names it (`aria-labelledby`): read out,
   * not shown.
   */
  title?: ReactNode;
  /**
   * Element the sheet is portalled into; the `drawerContainer` of `StorefrontUIProvider`, else
   * `document.body`.
   */
  container?: HTMLElement | null;
  classNames?: Partial<Record<SheetPart, string>>;
  styles?: Partial<Record<SheetPart, CSSProperties>>;
}

/**
 * Number of open sheets holding the height of the body, and the height it had before the
 * first of them: nested sheets share one hold, and the last to close gives it back.
 */
let bodyHolds = 0;
let bodyHeightBefore = '';

/**
 * Keeps the body as tall as the window while a sheet is open, so the sheet does not jump when
 * a mobile browser shows or hides its toolbars. Returns the release.
 */
function holdBodyHeight(): () => void {
  if (bodyHolds === 0) {
    bodyHeightBefore = document.body.style.height;
    document.body.style.height = `${window.innerHeight}px`;
  }
  bodyHolds += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    bodyHolds -= 1;
    if (bodyHolds === 0) document.body.style.height = bodyHeightBefore;
  };
}

/**
 * The vaul drawer of the storefront: a bottom sheet that follows the height of its content, or
 * a side panel. Opened from another sheet, it nests in it (the parent steps back while it is
 * open). It stands over the page at antd's `zIndexPopupBase`; popups opened from it read
 * `useDrawerLayer` to stand over it in turn.
 */
export const Sheet = ({
  ref,
  open,
  onClose,
  onExited,
  dismissible = true,
  children,
  direction = 'bottom',
  fullscreen,
  width,
  title,
  container,
  className,
  style,
  classNames,
  styles: partStyles,
  'aria-labelledby': labelledBy,
  'aria-label': label,
  ...rest
}: SheetProps) => {
  const { token } = theme.useToken();
  const parent = useDrawerLayer();
  const { drawerContainer, texts } = useStorefrontUI();
  const zIndex = parent ? parent.zIndex + 1 : token.zIndexPopupBase;
  const { styles, cx } = useStyles({ zIndex });
  const DrawerRoot = parent?.sheet ? NestedRoot : Root;
  const portalContainer = container ?? drawerContainer ?? undefined;
  const opener = useRef<HTMLElement | null>(null);
  const releaseBody = useRef<(() => void) | null>(null);
  const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null);

  const isLeft = direction === 'left';
  const isRight = direction === 'right';
  const isHorizontal = isLeft || isRight;
  const isVertical = !isHorizontal;

  const [height, setHeight] = useState<Height>(0);
  const [measured, setMeasured] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    releaseBody.current ??= holdBodyHeight();
    if (isVertical) setHeight('auto');
  }, [open, isVertical]);

  // An unmounted sheet gives the body back at once, whether it finished closing or not.
  useEffect(
    () => () => {
      releaseBody.current?.();
      releaseBody.current = null;
    },
    []
  );

  useEffect(() => {
    if (!isVertical || !measured) return;
    const resizeObserver = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    resizeObserver.observe(measured);
    return () => resizeObserver.disconnect();
  }, [measured, isVertical]);

  const handleTeardown = useCallback(() => {
    if (open) return;
    releaseBody.current?.();
    releaseBody.current = null;
    if (isVertical) setHeight(0);
    onExited?.();
  }, [open, isVertical, onExited]);

  const handleContentAnimationEnd = useCallback(
    (event: AnimationEvent<HTMLDivElement>) => {
      if (
        event.target === event.currentTarget &&
        event.animationName.startsWith('slideTo')
      ) {
        handleTeardown();
      }
    },
    [handleTeardown]
  );

  const setContentRef = useCallback(
    (node: HTMLDivElement | null) => {
      setContentNode(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  const layer = useMemo<DrawerLayer>(
    () => ({ zIndex: zIndex + 1, container: contentNode, sheet: true }),
    [zIndex, contentNode]
  );

  // Unset, the name is left to the dialog, which takes it from its title below.
  const named = Boolean(labelledBy || label);
  const naming = named
    ? { 'aria-labelledby': labelledBy, 'aria-label': label }
    : {};
  const body = (
    <div
      className={cx(
        styles.body,
        isVertical && styles.bodyVertical,
        classNames?.body
      )}
      style={partStyles?.body}
    >
      <DrawerLayerContext.Provider value={layer}>
        {children}
      </DrawerLayerContext.Provider>
    </div>
  );

  return (
    <DrawerRoot
      open={open}
      onClose={onClose}
      dismissible={dismissible}
      direction={direction}
      onAnimationEnd={handleTeardown}
      disablePreventScroll={false}
      container={portalContainer}
    >
      <Portal container={portalContainer}>
        <Content
          // No description unless one is given: the dialog does not ask for one then.
          aria-describedby={undefined}
          {...rest}
          {...naming}
          ref={setContentRef}
          onOpenAutoFocus={() => {
            opener.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            opener.current?.focus();
          }}
          onAnimationEnd={handleContentAnimationEnd}
          style={{
            ...(isHorizontal ? { width } : undefined),
            ...partStyles?.root,
            ...style,
          }}
          className={cx(
            styles.content,
            isVertical && styles.contentVertical,
            isHorizontal && styles.contentHorizontal,
            isLeft && styles.contentLeft,
            isRight && styles.contentRight,
            fullscreen && styles.contentFullscreen,
            classNames?.root,
            className
          )}
        >
          {/* The dialog always has a name: the given one, else the title, else "Dialog". The
              dialog requires its title element either way; with a name given it is not read. */}
          <Drawer.Title asChild>
            <VisuallyHidden aria-hidden={named || undefined}>
              {title ?? label ?? texts.dialog}
            </VisuallyHidden>
          </Drawer.Title>
          {isVertical ? (
            <AnimateHeight duration={300} height={height} disableDisplayNone>
              <div ref={setMeasured} className={styles.frame}>
                <div
                  className={cx(styles.handle, classNames?.handle)}
                  style={partStyles?.handle}
                />
                {body}
              </div>
            </AnimateHeight>
          ) : (
            body
          )}
        </Content>
        <Overlay
          className={cx(styles.overlay, classNames?.overlay)}
          style={partStyles?.overlay}
        />
      </Portal>
    </DrawerRoot>
  );
};
