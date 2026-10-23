'use client';

import { UserAddOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import {
  FloatingLabelInput,
  FloatingLabelPassword,
  isEmail,
} from '@shopana/storefront-ui';
import type { AuthError } from '../../core/AuthError';
import type { AuthMethods } from '../../core/types';
import { useAuthUI } from '../AuthUIProvider';
import { InlineAction, SubmitButton } from '../common/actions';
import { AuthAlert, useErrorAlert, useRateLimit } from '../common/alerts';
import {
  AuthForm,
  EmailField,
  Field,
  usePasswordRules,
  useSubmit,
} from '../common/form';
import { ScreenTitle } from '../common/heading';
import { Badge, Footer, Screen } from '../common/layout';
import { useScreenPreset } from '../common/preset';
import { socialProviderView } from '../parts/providers';
import type { AuthContext, AuthDraft, AuthDraftChange } from './types';

export interface SignUpValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignUpScreenProps {
  context: AuthContext;
  methods: AuthMethods | null;
  /** The email typed so far; the names and the password are the screen's own. */
  draft: AuthDraft;
  onDraftChange: AuthDraftChange;
  pending: boolean;
  error: AuthError | null;
  onSubmit: (values: SignUpValues) => void;
  onSignIn: () => void;
  onCode: () => void;
  onSocial: (provider: string) => void;
}

/** A password account: the first and the last name are required. */
export const SignUpScreen = ({
  context,
  methods,
  draft,
  onDraftChange,
  pending,
  error,
  onSubmit,
  onSignIn,
  onCode,
  onSocial,
}: SignUpScreenProps) => {
  const t = useTranslations('Auth');
  const { styles } = useStyles();
  const { components, legalLinks, part } = useAuthUI();
  const { Divider, SocialButtons, Legal, PasswordRules } = components;
  const preset = useScreenPreset();
  const titleId = useId();
  const rulesId = useId();
  const [firstName, setFirstName] = useState(preset.firstName ?? '');
  const [lastName, setLastName] = useState(preset.lastName ?? '');
  const [password, setPassword] = useState(preset.password ?? '');
  const waiting = useRateLimit(error);
  const email = draft.email;
  const minLength = methods?.password.minLength ?? 8;
  const maxLength = methods?.password.maxLength ?? 128;
  const nameMissing = !firstName.trim();
  const lastNameMissing = !lastName.trim();
  const providers = (methods?.social ?? [])
    .filter((item) => item.signUp)
    .map((item) => socialProviderView(item.provider));

  const form = useSubmit();
  const rules = usePasswordRules(password, {
    minLength,
    maxLength,
    submitted: form.submitted,
  });
  const valid =
    !nameMissing && !lastNameMissing && isEmail(email) && rules.valid;

  const alert = useErrorAlert(error, context, {
    userExists: (
      <AuthAlert type="info">
        {t.rich('signUp.userExists', {
          link: (chunks) => (
            <InlineAction onClick={onSignIn}>{chunks}</InlineAction>
          ),
        })}
      </AuthAlert>
    ),
    signUpDisabled: (
      <AuthAlert type="warning">
        {t.rich('signUp.signUpDisabled', {
          link: (chunks) => (
            <InlineAction onClick={onCode}>{chunks}</InlineAction>
          ),
        })}
      </AuthAlert>
    ),
  });

  return (
    <Screen>
      <Badge icon={<UserAddOutlined />} />
      <ScreenTitle id={titleId} title={t('signUp.title')} />
      {alert}
      <AuthForm
        labelledBy={titleId}
        onSubmit={() =>
          form.submit(valid, () =>
            onSubmit({
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.trim(),
              password,
            })
          )
        }
      >
        <div className={styles.names}>
          <Field>
            <FloatingLabelInput
              label={t('signUp.firstName')}
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              error={
                form.submitted && nameMissing
                  ? t('signUp.firstNameMissing')
                  : undefined
              }
            />
          </Field>
          <Field>
            <FloatingLabelInput
              label={t('signUp.lastName')}
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              error={
                form.submitted && lastNameMissing
                  ? t('signUp.lastNameMissing')
                  : undefined
              }
            />
          </Field>
        </div>
        <EmailField
          value={email}
          onChange={(next) => onDraftChange({ email: next })}
          submitted={form.submitted}
          error={error}
        />
        <Field>
          <FloatingLabelPassword
            label={t('common.password')}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={minLength}
            maxLength={maxLength}
            status={rules.failed ? 'error' : undefined}
            aria-invalid={rules.failed || undefined}
            aria-describedby={rulesId}
          />
          <PasswordRules {...part('rules')} id={rulesId} rules={rules.rules} />
        </Field>
        <SubmitButton
          pending={pending}
          pendingLabel={t('common.pending')}
          disabled={waiting > 0 || error?.code === 'signUpDisabled'}
        >
          {t('signUp.submit')}
        </SubmitButton>
      </AuthForm>
      {providers.length ? (
        <>
          <Divider {...part('divider')} label={t('common.or')} />
          <SocialButtons
            {...part('social')}
            intent="signUp"
            providers={providers}
            label={t('social.signUpGroup')}
            buttonLabel={(provider) =>
              t('social.signUp', { provider: provider.name })
            }
            disabled={pending}
            onSelect={onSocial}
          />
        </>
      ) : null}
      <Legal {...part('legal')} links={legalLinks} />
      <Footer>
        {t.rich('signUp.signInPrompt', {
          link: (chunks) => (
            <InlineAction onClick={onSignIn}>{chunks}</InlineAction>
          ),
        })}
      </Footer>
    </Screen>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  names: css`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${token.paddingSM}px;
  `,
}));
