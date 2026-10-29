'use client';

import { ConfigProvider, Modal, theme, Typography } from 'antd';
import type { ModalProps } from 'antd';
import { createStyles } from 'antd-style';
import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';
import type { CSSProperties, ReactNode, Ref } from 'react';
import type { Breakpoint } from '../breakpoints';
import { applyDomAttributes, type DomAttributes } from '../dom';
import { useBreakpointDown } from '../useMediaQuery';
import { DrawerLayerContext, useDrawerLayer, type DrawerLayer } from './layer';
import { useStorefrontUI } from '../StorefrontUIProvider';
import { Sheet } from './Sheet';

/** Parts of the dialog, the same in the modal and in the sheet. `root` is the panel. */
export type ResponsiveDialogPart =
  | 'root'
  | 'header'
  | 'title'
  | 'body'
  | 'footer';

export interface ResponsiveDialogProps extends DomAttributes {
  /** The panel: the modal's dialog element, or the sheet's. */
  ref?: Ref<HTMLDivElement>;
  open: boolean;
  onClose: () => void;
  /** Called after the closing animation, when the content is gone. */
  onExited?: () => void;
  /** Title over the content; it names the dialog. */
  title?: ReactNode;
  /** Under the content, e.g. a link or the buttons of the dialog. */
  footer?: ReactNode;
  children: ReactNode;
  /** Width of the modal; 440px by default. */
  width?: number;
  /** Shows the close button of the modal; a sheet closes by dragging it down. */
  closable?: boolean;
  /** Below it the dialog is a bottom sheet; `md` by default. */
  breakpoint?: Breakpoint;
  /**
   * z-index of the dialog. By default it stands over the drawer it is opened from
   * (`useDrawerLayer`), else at antd's `zIndexPopupBase`.
   */
  zIndex?: number;
  className?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<ResponsiveDialogPart, string>>;
  styles?: Partial<Record<ResponsiveDialogPart, CSSProperties>>;
}

/**
 * A dialog that fits the screen: an antd `Modal` from `breakpoint` up and a vaul bottom sheet
 * below it, with the same title, content and footer in both.
 */
export const ResponsiveDialog = ({
  ref,
  open,
  onClose,
  onExited,
  title,
  footer,
  children,
  width = 440,
  closable = true,
  breakpoint = 'md',
  zIndex: zIndexProp,
  className,
  style,
  classNames,
  styles: partStyles,
  ...attributes
}: ResponsiveDialogProps) => {
  const { styles, cx } = useStyles();
  const { token } = theme.useToken();
  const isSheet = useBreakpointDown(breakpoint);
  const parent = useDrawerLayer();
  const { dialogMotion } = useStorefrontUI();
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const titleId = useId();
  const zIndex =
    zIndexProp ?? (parent ? parent.zIndex + 1 : token.zIndexPopupBase);
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const labelledBy =
    attributes['aria-labelledby'] ?? (title ? titleId : undefined);

  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      setPanel(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  // The modal renders its dialog element itself: the attributes are set on it once it is there.
  const attributesKey = JSON.stringify(attributes);
  useEffect(() => {
    if (isSheet || !panel) return;
    return applyDomAttributes(
      panel,
      JSON.parse(attributesKey) as DomAttributes
    );
  }, [isSheet, panel, attributesKey]);

  const layer = useMemo<DrawerLayer>(
    () => ({ zIndex, container: null, sheet: false }),
    [zIndex]
  );

  if (isSheet) {
    return (
      <Sheet
        {...attributes}
        ref={setPanelRef}
        aria-labelledby={labelledBy}
        open={open}
        onClose={onClose}
        onExited={onExited}
        direction="bottom"
        className={cx(classNames?.root, className)}
        style={{ ...partStyles?.root, ...style }}
      >
        <div className={styles.sheet}>
          {title ? (
            <div
              className={cx(styles.sheetHeader, classNames?.header)}
              style={partStyles?.header}
            >
              <Typography.Text
                id={titleId}
                strong
                className={cx(styles.sheetTitle, classNames?.title)}
                style={partStyles?.title}
              >
                {title}
              </Typography.Text>
            </div>
          ) : null}
          <div
            className={cx(
              styles.sheetBody,
              !footer && styles.sheetEnd,
              classNames?.body
            )}
            style={partStyles?.body}
          >
            {children}
          </div>
          {footer ? (
            <div
              className={cx(
                styles.sheetFooter,
                styles.sheetEnd,
                classNames?.footer
              )}
              style={partStyles?.footer}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </Sheet>
    );
  }

  // `panelRef` is a prop of antd's Modal its types leave out: the dialog element.
  const fade = dialogMotion === 'fade' ? getPrefixCls('fade') : undefined;
  const modalProps: ModalProps & { panelRef: Ref<HTMLDivElement> } = {
    open,
    onCancel: onClose,
    afterClose: onExited,
    title: title ? <span id={titleId}>{title}</span> : undefined,
    footer: footer ?? null,
    centered: true,
    width,
    closable,
    destroyOnHidden: true,
    transitionName: fade,
    maskTransitionName: fade,
    zIndex,
    className,
    style,
    classNames: {
      header: classNames?.header,
      title: classNames?.title,
      body: classNames?.body,
      footer: classNames?.footer,
      container: classNames?.root,
    },
    styles: {
      header: partStyles?.header,
      title: partStyles?.title,
      body: partStyles?.body,
      footer: partStyles?.footer,
      container: partStyles?.root,
    },
    panelRef: setPanelRef,
  };
  return (
    <Modal {...modalProps}>
      <DrawerLayerContext.Provider value={layer}>
        {children}
      </DrawerLayerContext.Provider>
    </Modal>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  sheet: css`
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
  `,
  sheetHeader: css`
    flex-shrink: 0;
    padding: ${token.paddingSM}px ${token.padding}px 0;
  `,
  sheetTitle: css`
    font-size: ${token.fontSizeLG}px;
  `,
  sheetBody: css`
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: ${token.paddingSM}px ${token.padding}px;
  `,
  sheetFooter: css`
    flex-shrink: 0;
    padding: 0 ${token.padding}px;
  `,
  // The last part keeps clear of the bottom edge and the home indicator.
  sheetEnd: css`
    padding-bottom: calc(${token.paddingLG}px + var(--safe-area-bottom, 0px));
  `,
}));
