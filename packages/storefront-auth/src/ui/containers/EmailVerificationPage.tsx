'use client';

import { useState } from 'react';
import {
  clearEmailVerificationLink,
  readEmailVerificationLink,
} from '../../core/links';
import { useAuth } from '../../react/useAuth';
import { useLocationLink } from '../common/useLocationLink';
import { useLocalizedAuthPaths } from '../hooks/useLocalizedAuthPaths';
import { AuthIntlProvider } from '../i18n/AuthIntlProvider';
import { EmailVerificationScreen } from '../screens/EmailVerificationScreen';
import { draftOf, type AuthDraft } from '../screens/types';
import { AuthCard } from './AuthCard';
import { PageLoading } from './PageLoading';

export interface EmailVerificationPageProps {
  /** Opens the sign-in (the store's `AuthDialog`). */
  onSignIn: () => void;
  /** Page of the new verification link; `/account/verify-email` of the active locale by default. */
  verifyPath?: string;
  /**
   * Query of the page from the host's router; `location.search` by default, which a client-side
   * navigation to the page does not update.
   */
  search?: string;
  className?: string;
}

/**
 * `/account/verify-email`: the outcome IAM put into the link, removed from the address bar once
 * read. A confirmed email signs in; a spent link sends a new email.
 */
export const EmailVerificationPage = ({
  className,
  ...props
}: EmailVerificationPageProps) => (
  <AuthIntlProvider>
    <AuthCard className={className}>
      <EmailVerificationContent {...props} />
    </AuthCard>
  </AuthIntlProvider>
);

const EmailVerificationContent = ({
  onSignIn,
  verifyPath: verifyPathOption,
  search,
}: Omit<EmailVerificationPageProps, 'className'>) => {
  const { verifyPath } = useLocalizedAuthPaths({ verifyPath: verifyPathOption });
  const auth = useAuth();
  const link = useLocationLink(
    readEmailVerificationLink,
    clearEmailVerificationLink,
    search
  );
  const [draft, setDraft] = useState<AuthDraft>(() => draftOf());

  if (link === undefined) return <PageLoading />;

  return (
    <EmailVerificationScreen
      context="store"
      state={link && 'verified' in link ? 'verified' : 'expired'}
      draft={draft}
      onDraftChange={(patch) =>
        setDraft((current) => ({ ...current, ...patch }))
      }
      sent={auth.step.type === 'verificationSent'}
      pending={auth.isPending}
      error={auth.error}
      onResend={(target) =>
        void auth.emailVerification.resend(target, { verifyPath })
      }
      onSignIn={onSignIn}
    />
  );
};
