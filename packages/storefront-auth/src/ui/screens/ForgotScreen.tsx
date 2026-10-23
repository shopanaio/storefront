'use client';

import { KeyOutlined, MailOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { FloatingLabelInput } from '@shopana/storefront-ui';
import type { AuthError } from '../../core/AuthError';
import {
  AuthAlert,
  Badge,
  Chip,
  Field,
  RateLimitAlert,
  Screen,
  ScreenTitle,
  Stack,
  SubmitButton,
  TextAction,
  useRateLimit,
} from '../common/Screen';
import { isEmail } from '../common/validation';
import { contextCopy, type AuthContext } from './types';

export interface ForgotScreenProps {
  context: AuthContext;
  email: string;
  onEmailChange: (email: string) => void;
  /** The link was sent: "Check your email". */
  sent: boolean;
  /** The link was sent once more. */
  resent: boolean;
  pending: boolean;
  error: AuthError | null;
  onSubmit: (email: string) => void;
  onResend: () => void;
  onChangeEmail: () => void;
  onBackToSignIn: () => void;
}

/** A link to set a new password; never says whether the email has an account. */
export const ForgotScreen = ({
  context,
  email,
  onEmailChange,
  sent,
  resent,
  pending,
  error,
  onSubmit,
  onResend,
  onChangeEmail,
  onBackToSignIn,
}: ForgotScreenProps) => {
  const t = useTranslations('Auth');
  const { styles } = useStyles();
  const copy = contextCopy(context);
  const titleId = useId();
  const [touched, setTouched] = useState(false);
  const waiting = useRateLimit(error);
  const invalid = (touched && !isEmail(email)) || error?.code === 'invalidInput';

  if (sent) {
    return (
      <Screen>
        <Badge icon={<MailOutlined />} />
        <ScreenTitle title={t('forgot.sentTitle')} subtitle={t('forgot.sentSubtitle')} />
        <Chip
          value={email.trim()}
          action={{
            label: t('common.change'),
            ariaLabel: t('common.changeEmail'),
            onClick: onChangeEmail,
          }}
        />
        {resent && !error ? <AuthAlert type="info">{t('forgot.resent')}</AuthAlert> : null}
        <RateLimitAlert error={error} />
        {error?.code === 'unavailable' ? (
          <AuthAlert type="error">{t(copy.unavailable)}</AuthAlert>
        ) : null}
        <Stack>
          <SubmitButton htmlType="button" onClick={onBackToSignIn}>
            {t('common.backToSignIn')}
          </SubmitButton>
        </Stack>
        <span className={styles.links}>
          <Typography.Text type="secondary">{t('forgot.notReceived')}</Typography.Text>
          <TextAction onClick={onResend} disabled={pending || waiting > 0}>
            {pending ? t('forgot.resendPending') : t('forgot.resend')}
          </TextAction>
        </span>
      </Screen>
    );
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!isEmail(email)) return;
    onSubmit(email.trim());
  };

  return (
    <Screen>
      <Badge icon={<KeyOutlined />} />
      <ScreenTitle id={titleId} title={t('forgot.title')} subtitle={t('forgot.subtitle')} />
      <RateLimitAlert error={error} />
      {error?.code === 'unavailable' ? (
        <AuthAlert type="error">{t(copy.unavailable)}</AuthAlert>
      ) : null}
      <form className={styles.form} aria-labelledby={titleId} onSubmit={submit} noValidate>
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
          {t('forgot.submit')}
        </SubmitButton>
      </form>
      <TextAction onClick={onBackToSignIn}>
        {t('common.backToSignIn')}
      </TextAction>
    </Screen>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  form: css`
    display: flex;
    flex-direction: column;
    gap: ${token.paddingSM}px;
    width: 100%;
    margin: 0;
    text-align: left;
  `,
  links: css`
    display: inline-flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: ${token.marginXS}px;
  `,
}));
