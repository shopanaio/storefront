'use client';

import { CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { isEmail } from '@shopana/storefront-ui';
import type { AuthError } from '../../core/AuthError';
import { SubmitButton } from '../common/actions';
import { useErrorAlert, useRateLimit } from '../common/alerts';
import { AuthForm, EmailField, useSubmit } from '../common/form';
import { Chip } from '../common/layout';
import { ResultScreen } from './ResultScreen';
import type { AuthContext, AuthDraft, AuthDraftChange } from './types';

export interface EmailVerificationScreenProps {
  context: AuthContext;
  /** The email is confirmed, or the link is spent and a new email can be sent. */
  state: 'verified' | 'expired';
  /** The email typed so far. */
  draft: AuthDraft;
  onDraftChange: AuthDraftChange;
  /** A new verification email was sent. */
  sent: boolean;
  pending: boolean;
  error: AuthError | null;
  onResend: (email: string) => void;
  onSignIn: () => void;
}

/** The page a verification link opens (`/account/verify-email`). */
export const EmailVerificationScreen = ({
  context,
  state,
  draft,
  onDraftChange,
  sent,
  pending,
  error,
  onResend,
  onSignIn,
}: EmailVerificationScreenProps) => {
  const t = useTranslations('Auth');
  const titleId = useId();
  const form = useSubmit();
  const waiting = useRateLimit(error);
  const alert = useErrorAlert(error, context);
  const email = draft.email;

  if (state === 'verified') {
    return (
      <ResultScreen
        tone="success"
        icon={<CheckOutlined />}
        title={t('emailVerified.title')}
        subtitle={t('emailVerified.subtitle')}
        actions={
          <SubmitButton htmlType="button" onClick={onSignIn}>
            {t('common.signIn')}
          </SubmitButton>
        }
      />
    );
  }

  return (
    <ResultScreen
      tone="warning"
      icon={<ExclamationCircleOutlined />}
      titleId={titleId}
      title={t('linkExpired.title')}
      subtitle={
        sent
          ? t('linkExpired.verifySentSubtitle')
          : t('linkExpired.verifySubtitle')
      }
      alerts={alert}
      chip={sent ? <Chip value={email.trim()} /> : null}
      actions={
        sent ? (
          <SubmitButton htmlType="button" onClick={onSignIn}>
            {t('common.signIn')}
          </SubmitButton>
        ) : (
          <AuthForm
            labelledBy={titleId}
            onSubmit={() =>
              form.submit(isEmail(email), () => onResend(email.trim()))
            }
          >
            <EmailField
              value={email}
              onChange={(next) => onDraftChange({ email: next })}
              submitted={form.submitted}
              error={error}
            />
            <SubmitButton
              pending={pending}
              pendingLabel={t('common.pending')}
              disabled={waiting > 0}
            >
              {t('linkExpired.verifyAction')}
            </SubmitButton>
          </AuthForm>
        )
      }
    />
  );
};
