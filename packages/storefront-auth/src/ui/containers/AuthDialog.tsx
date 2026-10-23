'use client';

import { useState } from 'react';
import { AuthFlow, type AuthFlowProps } from '../flow/AuthFlow';
import { AuthIntlProvider } from '../i18n/AuthIntlProvider';
import { CardHeader } from './Headers';
import { AuthDialogSurface, AuthDrawerSurface } from './surfaces';

export interface AuthDialogProps extends AuthFlowProps {
  open: boolean;
  onClose: () => void;
  /**
   * `dialog`: a 440px dialog on desktop (the store); `drawer`: a drawer on the right, as the
   * drawers of the checkout, its header carrying the title of the screen. A bottom sheet on a
   * phone in both. `dialog` by default.
   */
  presentation?: 'dialog' | 'drawer';
  /**
   * Header over the screen, given the navigation of the flow. In a dialog the store card's
   * header (back and the logo) by default; in a drawer none, its own header has the title.
   */
  renderHeader?: AuthFlowProps['renderHeader'];
}

/** Sign-in over the page; it closes itself once the buyer is signed in. */
export const AuthDialog = ({
  open,
  onClose,
  presentation = 'dialog',
  context = 'store',
  onCompleted,
  renderHeader,
  ...flowProps
}: AuthDialogProps) => {
  // Each opening starts from the first screen.
  const [session, setSession] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSession((value) => value + 1);
  }

  const flow = (header: AuthFlowProps['renderHeader']) => (
    <AuthFlow
      key={session}
      {...flowProps}
      context={context}
      renderHeader={header}
      onCompleted={() => {
        onCompleted?.();
        onClose();
      }}
    />
  );

  if (presentation === 'drawer') {
    return (
      <AuthIntlProvider>
        <AuthDrawerSurface open={open} onClose={onClose}>
          {flow(renderHeader)}
        </AuthDrawerSurface>
      </AuthIntlProvider>
    );
  }

  return (
    <AuthDialogSurface open={open} onClose={onClose}>
      {flow(
        renderHeader ??
          ((navigation) => (
            <CardHeader
              onBack={navigation.canGoBack ? navigation.back : undefined}
            />
          ))
      )}
    </AuthDialogSurface>
  );
};
