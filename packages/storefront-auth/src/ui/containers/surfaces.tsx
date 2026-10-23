'use client';

import { createStyles } from 'antd-style';
import { useId, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode, Ref } from 'react';
import {
  DrawerBase,
  ResponsiveDialog,
  useBreakpointDown,
} from '@shopana/storefront-ui';
import {
  AuthHeadingSlotContext,
  type AuthHeadingSlot,
} from '../common/heading';
import { CardHeader } from './Headers';

/** Below it the drawer is a bottom sheet: the breakpoint of `DrawerBase`. */
const DRAWER_BREAKPOINT = 'lg';

/**
 * The sign-in in a drawer, as the drawers of the checkout: its header carries the title of the
 * screen (rendered there by the screen) and the close button of a side panel; a bottom sheet
 * closes by dragging it down.
 */
export const AuthDrawerSurface = ({
  open,
  onClose,
  width,
  children,
}: {
  open: boolean;
  onClose: () => void;
  width?: number;
  children: ReactNode;
}) => {
  const { styles } = useStyles();
  const isSheet = useBreakpointDown(DRAWER_BREAKPOINT);
  const titleId = useId();
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  const heading = useMemo<AuthHeadingSlot>(() => ({ slot }), [slot]);
  return (
    <DrawerBase
      open={open}
      onClose={onClose}
      breakpoint={DRAWER_BREAKPOINT}
      width={width}
      aria-labelledby={titleId}
      header={
        <DrawerBase.Header>
          <div id={titleId} ref={setSlot} className={styles.title} />
          {isSheet ? null : <DrawerBase.CloseButton />}
        </DrawerBase.Header>
      }
    >
      <AuthHeadingSlotContext.Provider value={heading}>
        {children}
      </AuthHeadingSlotContext.Provider>
    </DrawerBase>
  );
};

/** The sign-in in a 440px dialog of the store, a bottom sheet on a phone. */
export const AuthDialogSurface = ({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) => {
  const { styles } = useStyles();
  return (
    <ResponsiveDialog open={open} onClose={onClose}>
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
  title: css`
    flex: 1;
    min-width: 0;
  `,
  dialog: css`
    display: flex;
    flex-direction: column;
    gap: ${token.paddingLG}px;
    padding: ${token.paddingSM}px ${token.paddingSM}px ${token.padding}px;
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
