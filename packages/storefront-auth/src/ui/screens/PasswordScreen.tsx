'use client';

import { KeyOutlined, MailOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { FloatingLabelInput, FloatingLabelPassword } from '@shopana/storefront-ui';
import type { AuthError } from '../../core/AuthError';
import type { AuthMethods } from '../../core/types';
import {
  AuthAlert,
  Field,
  Footer,
  InlineAction,
  RateLimitAlert,
  Screen,
  ScreenTitle,
  SubmitButton,
  TextAction,
  useRateLimit,
} from '../common/Screen';
import { isEmail } from '../common/validation';
import { contextCopy, type AuthContext } from './types';

export type PasswordNotice = 'verificationLink' | 'verificationResent' | 'signInRequired';

export interface PasswordScreenProps {
  context: AuthContext;
  methods: AuthMethods | null;
  email: string;
  onEmailChange: (email: string) => void;
  pending: boolean;
  error: AuthError | null;
  /** The email waits for its link, the link was sent again, or the account was just created. */
  notice: PasswordNotice | null;
  onSubmit: (input: { email: string; password: string }) => void;
  onForgot: () => void;
  onCode: () => void;
  onSignUp: () => void;
  onResendVerification: () => void;
  /** Password typed into the field (stories). */
  defaultPassword?: string;
}

/** Email and password; an unconfirmed email waits for its link here or goes to the code. */
export const PasswordScreen = ({
  context,
  methods,
  email,
  onEmailChange,
  pending,
  error,
  notice,
  onSubmit,
  onForgot,
  onCode,
  onSignUp,
  onResendVerification,
  defaultPassword = '',
}: PasswordScreenProps) => {
  const t = useTranslations('Auth');
  const { styles } = useStyles();
  const copy = contextCopy(context);
  const titleId = useId();
  const [password, setPassword] = useState(defaultPassword);
  const [touched, setTouched] = useState(false);
  const waiting = useRateLimit(error);
  const emailInvalid = (touched && !isEmail(email)) || error?.code === 'invalidInput';
  const wrong = error?.code === 'invalidCredentials';
  const hasCode = Boolean(methods?.emailOtp.signIn || methods?.phoneOtp.signIn);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!isEmail(email) || !password) return;
    onSubmit({ email: email.trim(), password });
  };

  const alert = (() => {
    switch (error?.code) {
      case 'invalidCredentials':
        return <AuthAlert type="error">{t('password.invalidCredentials')}</AuthAlert>;
      case 'rateLimited':
        return <RateLimitAlert error={error} />;
      case 'methodDisabled':
        return <AuthAlert type="error">{t('alerts.passwordDisabled')}</AuthAlert>;
      case 'unavailable':
        return <AuthAlert type="error">{t(copy.unavailable)}</AuthAlert>;
      case 'expired':
        return <AuthAlert type="warning">{t('alerts.expired')}</AuthAlert>;
      default:
        return null;
    }
  })();

  return (
    <Screen>
      <ScreenTitle id={titleId} title={t('password.title')} />
      {alert}
      {notice === 'verificationLink' || notice === 'verificationResent' ? (
        <AuthAlert type="info" icon={<MailOutlined />}>
          {t.rich('password.verificationLink', {
            email: email.trim(),
            b: (chunks) => <b>{chunks}</b>,
          })}{' '}
          <InlineAction
            disabled={notice === 'verificationResent' || pending}
            onClick={onResendVerification}
          >
            {notice === 'verificationResent' ? t('password.resent') : t('password.resend')}
          </InlineAction>
        </AuthAlert>
      ) : null}
      {notice === 'signInRequired' ? (
        <AuthAlert type="info">{t('password.signInRequired')}</AuthAlert>
      ) : null}
      <form className={styles.form} aria-labelledby={titleId} onSubmit={submit} noValidate>
        <Field>
          <FloatingLabelInput
            label={t('common.email')}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            status={emailInvalid ? 'error' : undefined}
            error={emailInvalid ? t('common.invalidEmail') : undefined}
          />
        </Field>
        <Field>
          <FloatingLabelPassword
            label={t('common.password')}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            status={wrong || (touched && !password) ? 'error' : undefined}
            toggleLabels={{
              show: t('common.showPassword'),
              hide: t('common.hidePassword'),
            }}
          />
        </Field>
        <SubmitButton
          pending={pending}
          pendingLabel={t('password.submitPending')}
          disabled={waiting > 0 || error?.code === 'methodDisabled'}
        >
          {t('password.submit')}
        </SubmitButton>
      </form>
      {methods?.password.reset ? (
        <TextAction onClick={onForgot}>{t('password.forgot')}</TextAction>
      ) : null}
      {hasCode ? (
        <Button shape="round" icon={<KeyOutlined aria-hidden />} onClick={onCode}>
          {t('password.withCode')}
        </Button>
      ) : null}
      {copy.offersPasswordSignUp && methods?.password.signUp ? (
        <Footer>
          {t.rich('password.signUpPrompt', {
            link: (chunks) => <InlineAction onClick={onSignUp}>{chunks}</InlineAction>,
          })}
        </Footer>
      ) : null}
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
}));
