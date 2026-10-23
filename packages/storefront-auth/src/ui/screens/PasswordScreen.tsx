'use client';

import { LockOutlined, MessageOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { FloatingLabelPassword, isEmail } from '@shopana/storefront-ui';
import type { AuthError } from '../../core/AuthError';
import type { AuthMethods } from '../../core/types';
import {
  InlineAction,
  ResendAction,
  SubmitButton,
  TextAction,
} from '../common/actions';
import { AuthAlert, useErrorAlert, useRateLimit } from '../common/alerts';
import { AuthForm, EmailField, Field, useSubmit } from '../common/form';
import { ScreenTitle } from '../common/heading';
import { Badge, Footer, Screen } from '../common/layout';
import { useScreenPreset } from '../common/preset';
import type {
  AuthContext,
  AuthDraft,
  AuthDraftChange,
  PasswordNotice,
} from './types';

export interface PasswordScreenProps {
  context: AuthContext;
  methods: AuthMethods | null;
  /** The email typed so far. */
  draft: AuthDraft;
  onDraftChange: AuthDraftChange;
  pending: boolean;
  error: AuthError | null;
  notice: PasswordNotice | null;
  onSubmit: (input: { email: string; password: string }) => void;
  onForgot: () => void;
  onCode: () => void;
  onSignUp: () => void;
  onResendVerification: () => void;
}

/** Email and password; an unconfirmed email waits for its link here or goes to the code. */
export const PasswordScreen = ({
  context,
  methods,
  draft,
  onDraftChange,
  pending,
  error,
  notice,
  onSubmit,
  onForgot,
  onCode,
  onSignUp,
  onResendVerification,
}: PasswordScreenProps) => {
  const t = useTranslations('Auth');
  const { styles } = useStyles();
  const preset = useScreenPreset();
  const titleId = useId();
  const wrongId = useId();
  const [password, setPassword] = useState(preset.password ?? '');
  const waiting = useRateLimit(error);
  const email = draft.email;
  const form = useSubmit();
  const wrong = error?.code === 'invalidCredentials';
  const missing = form.submitted && !password;
  const hasCode = Boolean(methods?.emailOtp.signIn || methods?.phoneOtp.signIn);
  const signUp = Boolean(methods?.password.signUp);

  const alert = useErrorAlert(error, context, {
    invalidCredentials: (
      <AuthAlert type="error" id={wrongId}>
        {t('password.invalidCredentials')}
      </AuthAlert>
    ),
    methodDisabled: (
      <AuthAlert type="error">{t('alerts.passwordDisabled')}</AuthAlert>
    ),
  });

  return (
    <Screen>
      <Badge icon={<LockOutlined />} />
      <ScreenTitle id={titleId} title={t('password.title')} />
      {alert}
      {notice === 'verificationLink' || notice === 'verificationResent' ? (
        <AuthAlert type="info">
          {t.rich('password.verificationLink', {
            email: email.trim(),
            b: (chunks) => <b>{chunks}</b>,
          })}{' '}
          <ResendAction
            appearance="inline"
            onResend={onResendVerification}
            pending={pending}
            error={error}
            done={notice === 'verificationResent'}
            label={t('password.resend')}
            doneLabel={t('password.resent')}
          />
        </AuthAlert>
      ) : null}
      {notice === 'signInRequired' ? (
        <AuthAlert type="info">{t('password.signInRequired')}</AuthAlert>
      ) : null}
      <AuthForm
        labelledBy={titleId}
        onSubmit={() =>
          form.submit(isEmail(email) && password.length > 0, () =>
            onSubmit({ email: email.trim(), password })
          )
        }
      >
        <EmailField
          value={email}
          onChange={(next) => onDraftChange({ email: next })}
          submitted={form.submitted}
          error={error}
          autoComplete="username"
        />
        <Field>
          <FloatingLabelPassword
            label={t('common.password')}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            // A wrong password is told by the alert over the form, which describes the field.
            status={wrong ? 'error' : undefined}
            aria-invalid={wrong || missing || undefined}
            aria-describedby={wrong ? wrongId : undefined}
            error={missing ? t('password.missing') : undefined}
          />
          {/* Belongs to the password: right under its field. */}
          {methods?.password.reset ? (
            <span className={styles.forgot}>
              <InlineAction onClick={onForgot}>
                {t('password.forgot')}
              </InlineAction>
            </span>
          ) : null}
        </Field>
        <SubmitButton
          pending={pending}
          pendingLabel={t('password.submitPending')}
          disabled={waiting > 0 || error?.code === 'methodDisabled'}
        >
          {t('password.submit')}
        </SubmitButton>
      </AuthForm>
      {/* The other ways in, together under the form. */}
      {hasCode || signUp ? (
        <div className={styles.otherWays}>
          {hasCode ? (
            <TextAction icon={<MessageOutlined aria-hidden />} onClick={onCode}>
              {t('password.withCode')}
            </TextAction>
          ) : null}
          {signUp ? (
            <Footer>
              {t.rich('password.signUpPrompt', {
                link: (chunks) => (
                  <InlineAction onClick={onSignUp}>{chunks}</InlineAction>
                ),
              })}
            </Footer>
          ) : null}
        </div>
      ) : null}
    </Screen>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  forgot: css`
    display: flex;
    justify-content: flex-end;
  `,
  // The last line stands 16px under the text above it, as on the other screens: the link
  // button over it adds its own room of a control (32px) around a line of text.
  otherWays: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${token.padding -
    (token.controlHeight - token.fontSize * token.lineHeight) / 2}px;
  `,
}));
