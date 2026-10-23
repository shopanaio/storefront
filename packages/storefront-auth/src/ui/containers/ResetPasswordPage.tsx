'use client';

import {
  clearPasswordResetLink,
  readPasswordResetLink,
} from '../../core/links';
import { useAuth } from '../../react/useAuth';
import { useLocationLink } from '../common/useLocationLink';
import { AuthIntlProvider } from '../i18n/AuthIntlProvider';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { AuthCard } from './AuthCard';
import { PageLoading } from './PageLoading';

export interface ResetPasswordPageProps {
  /** Opens the sign-in (the store's `AuthDialog`, on its password screen). */
  onSignIn: () => void;
  /** Asks for another link (the sign-in on its forgot-password screen). */
  onRequestNewLink: () => void;
  /**
   * Query of the page from the host's router; `location.search` by default, which a client-side
   * navigation to the page does not update.
   */
  search?: string;
  className?: string;
}

/**
 * `/account/reset-password`: reads the token IAM put into the link, removes it from the address
 * bar and sets the new password; a spent or invalid link offers a new one.
 */
export const ResetPasswordPage = ({
  className,
  ...props
}: ResetPasswordPageProps) => (
  <AuthIntlProvider>
    <AuthCard className={className}>
      <ResetPasswordContent {...props} />
    </AuthCard>
  </AuthIntlProvider>
);

const ResetPasswordContent = ({
  onSignIn,
  onRequestNewLink,
  search,
}: Omit<ResetPasswordPageProps, 'className'>) => {
  const auth = useAuth();
  // Kept once read: the address bar has no token after it.
  const link = useLocationLink(
    readPasswordResetLink,
    clearPasswordResetLink,
    search
  );

  if (link === undefined || auth.status === 'loading') return <PageLoading />;

  const state =
    auth.step.type === 'passwordReset'
      ? 'done'
      : !link || 'error' in link
        ? 'expired'
        : 'form';

  return (
    <ResetPasswordScreen
      context="store"
      state={state}
      minLength={auth.methods?.password.minLength ?? 8}
      maxLength={auth.methods?.password.maxLength ?? 128}
      pending={auth.isPending}
      error={auth.error}
      onSubmit={(password) => {
        if (link && 'token' in link)
          void auth.password.reset({ token: link.token, password });
      }}
      onSignIn={onSignIn}
      onRequestNewLink={onRequestNewLink}
    />
  );
};
