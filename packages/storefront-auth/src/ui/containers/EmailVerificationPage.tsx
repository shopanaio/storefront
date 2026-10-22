'use client';

import { Spin } from 'antd';
import { useMemo, useState } from 'react';
import { readEmailVerificationLink } from '../../core/links';
import { useLocationSearch } from '../common/useLocationSearch';
import { useAuth } from '../../react/useAuth';
import { AuthIntlProvider } from '../i18n/AuthIntlProvider';
import { EmailVerificationScreen } from '../screens/EmailVerificationScreen';
import { AuthCard } from './AuthCard';

export interface EmailVerificationPageProps {
  /** Opens the sign-in (the store's `AuthDialog`). */
  onSignIn: () => void;
  /** Page of the new verification link; `/account/verify-email` by default. */
  verifyPath?: string;
  className?: string;
}

type Link = ReturnType<typeof readEmailVerificationLink>;

/**
 * `/account/verify-email`: the outcome IAM put into the link. A confirmed email signs in; a
 * spent link sends a new email.
 */
export const EmailVerificationPage = ({
  onSignIn,
  verifyPath,
  className,
}: EmailVerificationPageProps) => (
  <AuthIntlProvider>
    <AuthCard className={className}>
      <EmailVerificationContent onSignIn={onSignIn} verifyPath={verifyPath} />
    </AuthCard>
  </AuthIntlProvider>
);

const EmailVerificationContent = ({
  onSignIn,
  verifyPath,
}: Omit<EmailVerificationPageProps, 'className'>) => {
  const auth = useAuth();
  const search = useLocationSearch();
  const link = useMemo<Link | undefined>(
    () => (search === null ? undefined : readEmailVerificationLink(search)),
    [search]
  );
  const [email, setEmail] = useState('');

  if (link === undefined) return <Spin size="large" />;

  return (
    <EmailVerificationScreen
      state={link && 'verified' in link ? 'verified' : 'expired'}
      email={email}
      onEmailChange={setEmail}
      sent={auth.step.type === 'verificationSent'}
      pending={auth.isPending}
      error={auth.error}
      onResend={(target) => void auth.emailVerification.resend(target, { verifyPath })}
      onSignIn={onSignIn}
    />
  );
};
