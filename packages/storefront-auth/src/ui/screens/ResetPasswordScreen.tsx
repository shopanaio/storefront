'use client';

import { CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { FloatingLabelPassword } from '@shopana/storefront-ui';
import type { AuthError } from '../../core/AuthError';
import { useAuthUI } from '../AuthUIProvider';
import { InlineAction, SubmitButton, TextAction } from '../common/actions';
import { AuthAlert, useErrorAlert, useRateLimit } from '../common/alerts';
import { AuthForm, Field, usePasswordRules, useSubmit } from '../common/form';
import { ScreenTitle } from '../common/heading';
import { Screen } from '../common/layout';
import { useScreenPreset } from '../common/preset';
import { ResultScreen } from './ResultScreen';
import type { AuthContext } from './types';

export interface ResetPasswordScreenProps {
  context: AuthContext;
  /** The new-password form, the password changed, or a link IAM found spent or invalid. */
  state: 'form' | 'done' | 'expired';
  minLength: number;
  maxLength: number;
  pending: boolean;
  error: AuthError | null;
  onSubmit: (password: string) => void;
  onSignIn: () => void;
  /** Asks for another reset link (the forgot-password screen). */
  onRequestNewLink: () => void;
}

/** The page a reset link opens (`/account/reset-password`): the new password, then sign in. */
export const ResetPasswordScreen = ({
  context,
  state,
  minLength,
  maxLength,
  pending,
  error,
  onSubmit,
  onSignIn,
  onRequestNewLink,
}: ResetPasswordScreenProps) => {
  const t = useTranslations('Auth');
  const { components, part } = useAuthUI();
  const { PasswordRules } = components;
  const preset = useScreenPreset();
  const titleId = useId();
  const rulesId = useId();
  const [password, setPassword] = useState(preset.password ?? '');
  const form = useSubmit();
  const waiting = useRateLimit(error);
  const rules = usePasswordRules(password, {
    minLength,
    maxLength,
    submitted: form.submitted || error?.code === 'invalidInput',
  });
  const linkInvalid = error?.code === 'expired';
  const alert = useErrorAlert(error, context, {
    expired: (
      <AuthAlert type="error">
        {t.rich('reset.linkInvalid', {
          link: (chunks) => (
            <InlineAction onClick={onRequestNewLink}>{chunks}</InlineAction>
          ),
        })}
      </AuthAlert>
    ),
  });

  if (state === 'done') {
    return (
      <ResultScreen
        tone="success"
        icon={<CheckOutlined />}
        title={t('reset.doneTitle')}
        subtitle={t('reset.doneSubtitle')}
        actions={
          <SubmitButton htmlType="button" onClick={onSignIn}>
            {t('common.signIn')}
          </SubmitButton>
        }
      />
    );
  }

  if (state === 'expired') {
    return (
      <ResultScreen
        tone="warning"
        icon={<ExclamationCircleOutlined />}
        title={t('linkExpired.title')}
        subtitle={t('linkExpired.resetSubtitle')}
        actions={
          <SubmitButton htmlType="button" onClick={onRequestNewLink}>
            {t('linkExpired.resetAction')}
          </SubmitButton>
        }
      />
    );
  }

  return (
    <Screen>
      <ScreenTitle
        id={titleId}
        title={t('reset.title')}
        subtitle={t('reset.subtitle')}
      />
      {alert}
      <AuthForm
        labelledBy={titleId}
        onSubmit={() => form.submit(rules.valid, () => onSubmit(password))}
      >
        <Field>
          <FloatingLabelPassword
            label={t('reset.label')}
            autoComplete="new-password"
            value={password}
            minLength={minLength}
            maxLength={maxLength}
            onChange={(event) => setPassword(event.target.value)}
            status={rules.failed ? 'error' : undefined}
            aria-invalid={rules.failed || undefined}
            aria-describedby={rulesId}
          />
          <PasswordRules {...part('rules')} id={rulesId} rules={rules.rules} />
        </Field>
        <SubmitButton
          pending={pending}
          pendingLabel={t('common.pending')}
          disabled={waiting > 0 || linkInvalid}
        >
          {t('reset.submit')}
        </SubmitButton>
      </AuthForm>
      <TextAction onClick={onSignIn}>{t('common.backToSignIn')}</TextAction>
    </Screen>
  );
};
