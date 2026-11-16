'use client';

import { createStyles } from 'antd-style';
import { useId, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode, Ref } from 'react';
import {
  DrawerBase,
  ResponsiveDialog,
  useBreakpointDown,
  type Breakpoint,
} from '@shopana/storefront-ui';
import {
  AuthHeadingSlotContext,
  type AuthHeadingSlot,
} from '../common/heading';
import { CardHeader } from './Headers';

/** Below it the drawer is a bottom sheet: the breakpoint of `DrawerBase`. */
const DRAWER_BREAKPOINT = 'lg';

/** Below it the dialog is a bottom sheet: the breakpoint of `ResponsiveDialog`. */
const DIALOG_BREAKPOINT = 'md';

/**
 * The sign-in in a drawer, as the drawers of the checkout: its header carries the title of the
 * screen (rendered there by the screen, as the drawer's title) and the close button. A bottom
 * sheet below `breakpoint`.
 */
export const AuthDrawerSurface = ({
  open,
  onClose,
  width,
  breakpoint = DRAWER_BREAKPOINT,
  children,
}: {
  open: boolean;
  onClose: () => void;
  width?: number;
  breakpoint?: Breakpoint;
  children: ReactNode;
}) => {
  const { styles } = useStyles();
  const titleId = useId();
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  const heading = useMemo<AuthHeadingSlot>(() => ({ slot }), [slot]);
  return (
    <DrawerBase
      open={open}
      onClose={onClose}
      breakpoint={breakpoint}
      width={width}
      // A short form: over the keyboard as tall as its content.
      keyboardHeight="content"
      aria-labelledby={titleId}
      header={
        <DrawerBase.Header>
          {/* The drawer's title, as DrawerBase.Title: it stands where a sheet has its title. */}
          <div
            id={titleId}
            ref={setSlot}
            data-drawer-title=""
            className={styles.title}
          />
          <DrawerBase.CloseButton />
        </DrawerBase.Header>
      }
    >
      <AuthHeadingSlotContext.Provider value={heading}>
        {children}
      </AuthHeadingSlotContext.Provider>
    </DrawerBase>
  );
};

/**
 * The sign-in in a 440px dialog of the store; on a phone the bottom sheet of the drawer, the
 * title of the screen in its header.
 */
export const AuthDialogSurface = ({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) => {
  const { styles, cx } = useStyles();
  const isSheet = useBreakpointDown(DIALOG_BREAKPOINT);
  if (isSheet) {
    return (
      <AuthDrawerSurface
        open={open}
        onClose={onClose}
        breakpoint={DIALOG_BREAKPOINT}
      >
        <div className={cx(styles.dialog, styles.dialogInSheet)}>
          {children}
        </div>
      </AuthDrawerSurface>
    );
  }
  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      breakpoint={DIALOG_BREAKPOINT}
    >
      <div className={styles.dialog}>{children}</div>
    </ResponsiveDialog>
  );
};

/** A store card on a page or in a story: the header over the screen, 440px wide at most. */
export const AuthCardSurface = ({
  onBack,
  className,
  style,
  children,
}: {
  onBack?: () => void;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) => {
  const { styles, cx } = useStyles();
  return (
    <div className={cx(styles.card, className)} style={style}>
      <CardHeader onBack={onBack} />
      {children}
    </div>
  );
};

/** The sign-in in the page itself, in a panel among the blocks of the checkout. */
export const AuthInlineSurface = ({
  ref,
  className,
  style,
  children,
}: {
  ref?: Ref<HTMLDivElement>;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) => {
  const { styles, cx } = useStyles();
  return (
    <div ref={ref} className={cx(styles.panel, className)} style={style}>
      {children}
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  // As DrawerBase.Title: the screen's title takes its size and weight from here.
  title: css`
    flex: 1;
    min-width: 0;
    font-size: ${token.fontSizeXL}px;
    font-weight: 600;
  `,
  dialog: css`
    display: flex;
    flex-direction: column;
    gap: ${token.paddingLG}px;
    padding: ${token.paddingSM}px ${token.paddingSM}px ${token.padding}px;
  `,
  // In the drawer's sheet: its body's padding at the sides and under it only, as the content
  // of the other drawers.
  dialogInSheet: css`
    padding-inline: 0;
    padding-bottom: 0;
  `,
  card: css`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: ${token.paddingLG}px;
    width: 100%;
    max-width: 440px;
    margin: 0 auto;
    padding: ${token.paddingLG}px ${token.paddingXL}px ${token.paddingXL}px;
    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadiusLG}px;
  `,
  // The side padding of the checkout blocks (an open method panel), so it sits among them;
  // more room above and below the form.
  panel: css`
    display: flex;
    flex-direction: column;
    gap: ${token.paddingSM}px;
    padding: ${token.paddingLG}px ${token.paddingSM}px;
    border: ${token.lineWidth}px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
  `,
}));
