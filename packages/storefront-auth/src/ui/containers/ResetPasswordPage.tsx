'use client';

import { Spin } from 'antd';
import { useEffect, useState } from 'react';
import { clearPasswordResetLink, readPasswordResetLink } from '../../core/links';
import { useAuth } from '../../react/useAuth';
import { AuthIntlProvider } from '../i18n/AuthIntlProvider';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { AuthCard } from './AuthCard';

export interface ResetPasswordPageProps {
  /** Opens the sign-in (the store's `AuthDialog`, on its password screen). */
  onSignIn: () => void;
  /** Asks for another link (the sign-in on its forgot-password screen). */
  onRequestNewLink: () => void;
  className?: string;
}

type Link = ReturnType<typeof readPasswordResetLink>;

/**
 * `/account/reset-password`: reads the token IAM put into the link, removes it from the address
 * bar and sets the new password; a spent or invalid link offers a new one.
 */
export const ResetPasswordPage = ({
  onSignIn,
  onRequestNewLink,
  className,
}: ResetPasswordPageProps) => (
  <AuthIntlProvider>
    <AuthCard className={className}>
      <ResetPasswordContent onSignIn={onSignIn} onRequestNewLink={onRequestNewLink} />
    </AuthCard>
  </AuthIntlProvider>
);

const ResetPasswordContent = ({
  onSignIn,
  onRequestNewLink,
}: Omit<ResetPasswordPageProps, 'className'>) => {
  const auth = useAuth();
  const [link, setLink] = useState<Link | undefined>(undefined);
  useEffect(() => {
    // The token is kept in state: the address bar has none after the first read.
    const read = readPasswordResetLink();
    setLink((current) => (current === undefined ? read : current));
    clearPasswordResetLink();
  }, []);

  if (link === undefined || auth.status === 'loading') return <Spin size="large" />;

  const state =
    auth.step.type === 'passwordReset'
      ? 'done'
      : !link || 'error' in link
        ? 'expired'
        : 'form';

  return (
    <ResetPasswordScreen
      state={state}
      minLength={auth.methods?.password.minLength ?? 8}
      maxLength={auth.methods?.password.maxLength ?? 128}
      pending={auth.isPending}
      error={auth.error}
      onSubmit={(password) => {
        if (link && 'token' in link) void auth.password.reset({ token: link.token, password });
      }}
      onSignIn={onSignIn}
      onRequestNewLink={onRequestNewLink}
    />
  );
};
