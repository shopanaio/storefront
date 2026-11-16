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
import { flushSync } from 'react-dom';
import { useStorefrontUI } from '../StorefrontUIProvider';
import { VisuallyHidden } from '../VisuallyHidden';
import {
  focusFieldsWithoutPan,
  isKeyboardField,
  isKeyboardUp,
  retainViewportBox,
} from '../visualViewport';
import { DrawerLayerContext, useDrawerLayer, type DrawerLayer } from './layer';
import { SHEET_RESIZE_MS, useStyles } from './styles';

export type DrawerDirection = 'top' | 'bottom' | 'left' | 'right';

/** How tall a bottom sheet is over the keyboard (SheetProps.keyboardHeight). */
export type SheetKeyboardHeight = 'full' | 'content';

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
  /**
   * A bottom sheet with a field taking the caret: `full` stands up to the whole screen over
   * the keyboard (a picker's list, a search); `content` rises over the keyboard as tall as
   * its content (a short form), its body scrolling when that is more than the room. `full`
   * by default.
   */
  keyboardHeight?: SheetKeyboardHeight;
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
 * `useDrawerLayer` to stand over it in turn. As a field of a bottom sheet takes the caret,
 * the sheet stands up to the whole screen over the keyboard (iOS's large detent, Android's
 * expanded sheet) until it closes, and iOS does not pan the page to the field.
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
  keyboardHeight = 'full',
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
  // A field of the bottom sheet has taken the caret (or a tap is giving it): the whole screen.
  const [expanded, setExpanded] = useState(false);
  // Stood up: the panel has reached the whole screen, its one transition is over.
  const [stood, setStood] = useState(false);

  const isLeft = direction === 'left';
  const isRight = direction === 'right';
  const isHorizontal = isLeft || isRight;
  const isVertical = !isHorizontal;

  // Opening, the panel is as tall as its content at once: vaul slides a box of its own height,
  // no height animating under the slide. Only later changes of its content are animated.
  const [height, setHeight] = useState<Height>('auto');
  const [measured, setMeasured] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    releaseBody.current ??= holdBodyHeight();
  }, [open]);

  // An unmounted sheet gives the body back at once, whether it finished closing or not.
  useEffect(
    () => () => {
      releaseBody.current?.();
      releaseBody.current = null;
    },
    []
  );

  // An open bottom sheet follows the visual viewport, the keyboard's height and state; one
  // stood up to the whole screen keeps following it until it has gone, so its height does not
  // fall back to the screen's as it slides away.
  const followsViewport = isVertical && (open || expanded);
  // Over the keyboard the sheet stands up to the whole screen, or stays its content's height.
  const stretches = keyboardHeight === 'full';
  useEffect(
    () => (followsViewport ? retainViewportBox() : undefined),
    [followsViewport]
  );

  // A field takes the caret, or a tap gives it to one: the sheet stands up to the whole screen.
  useEffect(() => {
    if (!open || !isVertical || !contentNode) return;
    const expand = () => setExpanded(true);
    const onFocusIn = (event: FocusEvent) => {
      if (isKeyboardField(event.target)) expand();
    };
    contentNode.addEventListener('focusin', onFocusIn);
    // A tap stands the sheet up at once, before the stand-in takes the caret: the stand-in is
    // placed at the top of the screen in the sheet as it is then, stood up, so that it stays
    // there, where iOS does not pan to it.
    const stopTaps = focusFieldsWithoutPan(contentNode, () =>
      flushSync(expand)
    );
    return () => {
      contentNode.removeEventListener('focusin', onFocusIn);
      stopTaps();
    };
  }, [open, isVertical, contentNode]);

  useEffect(() => {
    if (!isVertical || !measured) return;
    // Closing, it keeps its height: the keyboard going down does not lift it as it slides away.
    // Stood up, its height is the screen's alone, not its content's.
    if (!open || (expanded && stretches)) return;
    const resizeObserver = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    resizeObserver.observe(measured);
    return () => resizeObserver.disconnect();
  }, [measured, isVertical, open, expanded]);

  // Over the keyboard as tall as its content, the sheet keeps the place it rose to as the
  // keyboard goes down, as one stood up to the whole screen keeps its: the highest top its
  // panel reached over the keyboard, from the top of its box (--sheet-detent-top), down to the
  // bottom of the screen (panelFitted).
  useEffect(() => {
    if (!expanded || stretches || !contentNode) return;
    const panel = contentNode.querySelector<HTMLElement>('[data-sheet-panel]');
    if (!panel) return;
    let detent = Infinity;
    const measure = () => {
      if (!isKeyboardUp()) return;
      const top =
        panel.getBoundingClientRect().top -
        contentNode.getBoundingClientRect().top;
      if (top >= detent) return;
      detent = top;
      contentNode.style.setProperty('--sheet-detent-top', `${Math.round(top)}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    observer.observe(contentNode);
    measure();
    return () => {
      observer.disconnect();
      contentNode.style.removeProperty('--sheet-detent-top');
    };
  }, [expanded, stretches, contentNode]);

  // Stood up, the panel takes the screen's height from CSS alone (panelStanding), at once as
  // the keyboard moves; only standing up is animated, once (panelStandingUp).
  const standing = stretches && expanded;

  // The panel's height as the sheet is open; closing, the height animation is left as it
  // is (a change of it would hold the slide away back until it ends).
  const panelHeight = standing ? 'auto' : height;
  const openPanelHeight = useRef<Height>(panelHeight);
  if (open) openPanelHeight.current = panelHeight;

  // Closing stood up, the panel keeps the height it has, on its element: the keyboard going
  // down does not lift it as it slides away, and no prop of the height animation changes.
  useLayoutEffect(() => {
    if (open || !expanded) return;
    const panel = contentNode?.querySelector<HTMLElement>('[data-sheet-panel]');
    if (!panel) return;
    const frozen = `${panel.offsetHeight}px`;
    panel.style.setProperty('height', frozen, 'important');
    panel.style.setProperty('min-height', frozen, 'important');
    panel.style.setProperty('transition', 'none', 'important');
    return () => {
      panel.style.removeProperty('height');
      panel.style.removeProperty('min-height');
      panel.style.removeProperty('transition');
    };
  }, [open, expanded, contentNode]);
  // The transition of standing up is over, its end heard or not (a height that did not
  // change has none): the panel follows the box at once from then on.
  useEffect(() => {
    if (!standing || stood) return;
    const timer = window.setTimeout(() => setStood(true), SHEET_RESIZE_MS + 50);
    return () => window.clearTimeout(timer);
  }, [standing, stood]);

  const handleTeardown = useCallback(() => {
    if (open) return;
    releaseBody.current?.();
    releaseBody.current = null;
    setHeight('auto');
    setExpanded(false);
    setStood(false);
    onExited?.();
  }, [open, onExited]);

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
      repositionInputs={false}
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
          // Stood up, the sheet is the screen's box: a press on its clear top, over the
          // overlay, closes it as a press on the overlay does.
          onClick={(event) => {
            rest.onClick?.(event);
            if (expanded && dismissible && event.target === event.currentTarget)
              onClose();
          }}
          style={{
            ...(isHorizontal ? { width } : undefined),
            ...partStyles?.root,
            ...style,
          }}
          className={cx(
            styles.content,
            isVertical && styles.contentVertical,
            isVertical && expanded && styles.contentExpanded,
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
            <AnimateHeight
              // Stood up, its height is CSS's (panelStanding); over the keyboard as tall as its
              // content, its content's; closing, as it was.
              duration={expanded && stretches ? 0 : SHEET_RESIZE_MS}
              easing="ease"
              height={open ? panelHeight : openPanelHeight.current}
              disableDisplayNone
              data-sheet-panel=""
              className={cx(
                expanded && styles.panelExpanded,
                expanded && !stretches && styles.panelFitted,
                standing && styles.panelStanding,
                standing && !stood && styles.panelStandingUp
              )}
              onTransitionEnd={(event) => {
                if (
                  standing &&
                  event.target === event.currentTarget &&
                  event.propertyName === 'height'
                )
                  setStood(true);
              }}
            >
              <div
                ref={setMeasured}
                className={cx(
                  styles.frame,
                  expanded &&
                    (stretches ? styles.frameExpanded : styles.frameFitted)
                )}
              >
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
