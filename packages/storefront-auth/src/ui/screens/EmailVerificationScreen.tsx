'use client';

import { CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { FloatingLabelInput } from '@shopana/storefront-ui';
import type { AuthError } from '../../core/AuthError';
import { Chip, Field, RateLimitAlert, AuthAlert, SubmitButton, useRateLimit } from '../common/Screen';
import { isEmail } from '../common/validation';
import { ResultScreen } from './ResultScreen';

export interface EmailVerificationScreenProps {
  /** The email is confirmed, or the link is spent and a new email can be sent. */
  state: 'verified' | 'expired';
  email: string;
  onEmailChange: (email: string) => void;
  /** A new verification email was sent. */
  sent: boolean;
  pending: boolean;
  error: AuthError | null;
  onResend: (email: string) => void;
  onSignIn: () => void;
}

/** The page a verification link opens (`/account/verify-email`). */
export const EmailVerificationScreen = ({
  state,
  email,
  onEmailChange,
  sent,
  pending,
  error,
  onResend,
  onSignIn,
}: EmailVerificationScreenProps) => {
  const t = useTranslations('Auth');
  const { styles } = useStyles();
  const [touched, setTouched] = useState(false);
  const waiting = useRateLimit(error);

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

  const invalid = (touched && !isEmail(email)) || error?.code === 'invalidInput';
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!isEmail(email)) return;
    onResend(email.trim());
  };

  return (
    <ResultScreen
      tone="warning"
      icon={<ExclamationCircleOutlined />}
      title={t('linkExpired.title')}
      subtitle={sent ? t('linkExpired.verifySentSubtitle') : t('linkExpired.verifySubtitle')}
      alerts={
        <>
          <RateLimitAlert error={error} />
          {error?.code === 'unavailable' ? (
            <AuthAlert type="error">{t('alerts.unavailable')}</AuthAlert>
          ) : null}
        </>
      }
      chip={sent ? <Chip value={email.trim()} /> : null}
      actions={
        sent ? (
          <SubmitButton htmlType="button" onClick={onSignIn}>
            {t('common.signIn')}
          </SubmitButton>
        ) : (
          <form className={styles.form} onSubmit={submit} noValidate>
            <Field>
              <FloatingLabelInput
                label={t('common.email')}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                status={invalid ? 'error' : undefined}
                error={invalid ? t('common.invalidEmail') : undefined}
              />
            </Field>
            <SubmitButton pending={pending} pendingLabel={t('common.pending')} disabled={waiting > 0}>
              {t('linkExpired.verifyAction')}
            </SubmitButton>
          </form>
        )
      }
    />
  );
};

const useStyles = createStyles(({ css, token }) => ({
  form: css`
    display: flex;
    flex-direction: column;
    gap: ${token.paddingSM}px;
    width: 100%;
    margin: 0;
  `,
}));
