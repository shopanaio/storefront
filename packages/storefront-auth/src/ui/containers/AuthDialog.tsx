'use client';

import { createStyles } from 'antd-style';
import { useState } from 'react';
import { DrawerBase, ResponsiveDialog } from '@shopana/storefront-ui';
import { AuthHeadingContext, type AuthHeading } from '../common/Screen';
import { AuthFlow, type AuthFlowProps } from '../flow/AuthFlow';
import { AuthIntlProvider } from '../i18n/AuthIntlProvider';
import { CardHeader } from './Headers';

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
  const [heading, setHeading] = useState<AuthHeading | null>(null);
  // Each opening starts from the first screen.
  const [session, setSession] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSession((value) => value + 1);
  }

  const flow = (header: Pick<AuthFlowProps, 'renderHeader'> = {}) => (
    <AuthFlow
      key={session}
      {...flowProps}
      {...header}
      context={context}
      onCompleted={() => {
        onCompleted?.();
        onClose();
      }}
    />
  );

  if (context === 'checkoutGuest') {
    return (
      // The header is the drawer's own, as in every drawer of the checkout: the screen's title
      // is its `title`; the screens bring their own ways back.
      <AuthIntlProvider>
        <DrawerBase open={open} onClose={onClose} title={heading?.title}>
          <AuthHeadingContext.Provider value={setHeading}>{flow()}</AuthHeadingContext.Provider>
        </DrawerBase>
      </AuthIntlProvider>
    );
  }

  return (
    <ResponsiveDialog open={open} onClose={onClose}>
      <div className={styles.card}>
        {flow({ renderHeader: (navigation) => <CardHeader {...navigation} /> })}
      </div>
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
}));
