'use client';

import { ConfigProvider, Modal } from 'antd';
import { createStyles } from 'antd-style';
import { useContext } from 'react';
import type { ReactNode } from 'react';
import { LuX } from 'react-icons/lu';
import {
  DrawerBase,
  useBreakpointDown,
  type SheetDetent,
  type SheetKeyboardHeight,
} from '@shopana/storefront-ui';

export interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** The search field of a picker (cities, branches, streets), in view under the title. */
  search?: ReactNode;
  /**
   * Least height of the body, for content loaded as the buyer types, so the dialog does not
   * jump with each answer.
   */
  minHeight?: string;
  /** How tall the bottom sheet is over the keyboard (see `DrawerBase`). */
  keyboardHeight?: SheetKeyboardHeight;
  /** Where the bottom sheet stands as it opens (see `DrawerBase`). */
  detent?: SheetDetent;
  children: ReactNode;
}

/**
 * Dialog of the checkout (contacts, pickers of the delivery): a bottom sheet below `lg`, a
 * centered modal above it, as the dialogs of the theme. The modal fades in and out with its
 * mask; the header stays in view and the body scrolls under it.
 */
export const CheckoutDialog = ({
  open,
  onClose,
  title,
  search,
  minHeight,
  keyboardHeight,
  detent,
  children,
}: CheckoutDialogProps) => {
  const { styles } = useStyles();
  // The breakpoint of `DrawerBase`, below which it is a bottom sheet.
  const isSheet = useBreakpointDown('lg');
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);

  if (isSheet) {
    return (
      <DrawerBase
        minHeight={minHeight}
        keyboardHeight={keyboardHeight}
        detent={detent}
        open={open}
        onClose={onClose}
        title={title}
      >
        {/* The search in the body's scroll, stuck at its top: with the caret in a field out
            of the scroll, iOS pans the page with a drag on the list instead of scrolling it. */}
        {search ? <div className={styles.sheetSearch}>{search}</div> : null}
        {children}
      </DrawerBase>
    );
  }

  const fade = getPrefixCls('fade');
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={title}
      footer={null}
      closeIcon={<LuX size={24} aria-hidden />}
      width={560}
      centered
      transitionName={fade}
      maskTransitionName={fade}
      classNames={{
        container: styles.container,
        header: styles.header,
        title: styles.title,
        body: styles.body,
      }}
    >
      {search ? <div className={styles.search}>{search}</div> : null}
      <div className={styles.content} style={{ minHeight }}>
        {children}
      </div>
    </Modal>
  );
};

const useStyles = createStyles(({ css, token, prefixCls }) => ({
  // Stuck at the top of the sheet's body over the list scrolling under it.
  sheetSearch: css`
    position: sticky;
    top: -${token.paddingXS}px;
    z-index: 1;
    margin: -${token.paddingXS}px 0 0;
    padding: ${token.paddingXS}px 0 ${token.paddingXS}px;
    background: ${token.colorBgElevated};
  `,
  /**
   * As tall as its content up to the window; the header stays in view and the body scrolls
   * under it.
   */
  container: css`
    && {
      display: flex;
      flex-direction: column;
      max-height: calc(100dvh - ${token.paddingLG * 2}px);
      padding: 0;
      overflow: hidden;
    }

    .${prefixCls}-modal-close {
      top: ${token.paddingSM}px;
      inset-inline-end: ${token.paddingSM}px;
      width: ${token.controlHeightLG}px;
      height: ${token.controlHeightLG}px;
      color: ${token.colorText};
    }
  `,
  // As tall as the 40px close button with 12px around it, like the drawer header.
  header: css`
    && {
      flex: none;
      margin: 0;
      display: flex;
      align-items: center;
      min-height: ${token.paddingSM * 2 + token.controlHeightLG}px;
      padding: 0 ${token.paddingSM * 2 + token.controlHeightLG}px 0
        ${token.paddingLG}px;
      border-bottom: 1px solid ${token.colorBorderSecondary};
    }
  `,
  title: css`
    && {
      font-size: ${token.fontSizeXL}px;
      line-height: ${token.lineHeightLG};
      font-weight: ${token.fontWeightStrong};
    }
  `,
  body: css`
    && {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
  `,
  // The search field stays in view over the list.
  search: css`
    flex: none;
    padding: ${token.padding}px ${token.paddingLG}px 0;
  `,
  content: css`
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: ${token.padding}px ${token.paddingLG}px ${token.paddingLG}px;
  `,
}));
