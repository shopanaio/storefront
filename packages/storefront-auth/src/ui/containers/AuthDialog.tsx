'use client';

import { createStyles } from 'antd-style';
import { useState } from 'react';
import { DrawerBase, ResponsiveDialog } from '@shopana/storefront-ui';
import { AuthFlow, type AuthFlowProps } from '../flow/AuthFlow';
import { CardHeader, DrawerHeader } from './Headers';

export interface AuthDialogProps extends Omit<AuthFlowProps, 'context' | 'renderHeader'> {
  open: boolean;
  onClose: () => void;
  /**
   * `store`: a 440px dialog on desktop; `checkoutGuest`: a drawer on the right, as the checkout
   * drawers. A bottom sheet on a phone in both.
   */
  context?: 'store' | 'checkoutGuest';
}

/** Sign-in over the page; it closes itself once the buyer is signed in. */
export const AuthDialog = ({
  open,
  onClose,
  context = 'store',
  onCompleted,
  ...flowProps
}: AuthDialogProps) => {
  const { styles } = useStyles();
  // Each opening starts from the first screen.
  const [session, setSession] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSession((value) => value + 1);
  }

  const flow = (renderHeader: AuthFlowProps['renderHeader']) => (
    <AuthFlow
      key={session}
      {...flowProps}
      context={context}
      renderHeader={renderHeader}
      onCompleted={() => {
        onCompleted?.();
        onClose();
      }}
    />
  );

  if (context === 'checkoutGuest') {
    return (
      <DrawerBase
        open={open}
        onClose={onClose}
        header={<span />}
        contentClassName={styles.drawer}
      >
        {flow((navigation) => (
          <div className={styles.drawerHeader}>
            <DrawerHeader {...navigation} onClose={onClose} />
          </div>
        ))}
      </DrawerBase>
    );
  }

  return (
    <ResponsiveDialog open={open} onClose={onClose}>
      <div className={styles.card}>{flow((navigation) => <CardHeader {...navigation} />)}</div>
    </ResponsiveDialog>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    display: flex;
    flex-direction: column;
    gap: ${token.paddingLG + 4}px;
    padding: ${token.paddingSM}px ${token.paddingSM}px ${token.padding}px;
  `,
  drawer: css`
    gap: ${token.paddingLG}px;
  `,
  drawerHeader: css`
    margin: 0 -${token.paddingXS}px ${token.padding}px;
  `,
}));
