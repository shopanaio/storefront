'use client';

import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { FloatingLabelInput, FloatingLabelPassword } from '@shopana/storefront-ui';
import type { AuthError } from '../../core/AuthError';
import type { AuthMethods } from '../../core/types';
import { useAuthUI } from '../AuthUIProvider';
import {
  AuthAlert,
  Field,
  Footer,
  InlineAction,
  RateLimitAlert,
  Screen,
  ScreenTitle,
  SubmitButton,
  useRateLimit,
} from '../common/Screen';
import { isEmail } from '../common/validation';
import { socialProviderView } from '../parts/providers';
import { contextCopy, type AuthContext } from './types';

export interface SignUpValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignUpScreenProps {
  context: AuthContext;
  methods: AuthMethods | null;
  pending: boolean;
  error: AuthError | null;
  defaultValues?: Partial<SignUpValues>;
  /** Shows what does not pass the rules before a submit (stories). */
  showErrors?: boolean;
  onSubmit: (values: SignUpValues) => void;
  onSignIn: () => void;
  onCode: () => void;
  onSocial: (provider: string) => void;
}

/** A password account: the first name is required, the last name is not. */
export const SignUpScreen = ({
  context,
  methods,
  pending,
  error,
  defaultValues,
  showErrors = false,
  onSubmit,
  onSignIn,
  onCode,
  onSocial,
}: SignUpScreenProps) => {
  const t = useTranslations('Auth');
  const { styles, cx } = useStyles();
  const { components, legalLinks, part } = useAuthUI();
  const { Divider, SocialButtons, Legal } = components;
  const copy = contextCopy(context);
  const titleId = useId();
  const rulesId = useId();
  const [values, setValues] = useState<SignUpValues>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    ...defaultValues,
  });
  const [touched, setTouched] = useState(showErrors);
  const waiting = useRateLimit(error);
  const min = methods?.password.minLength ?? 8;
  const max = methods?.password.maxLength ?? 128;
  const nameMissing = !values.firstName.trim();
  const emailInvalid = !isEmail(values.email);
  const passwordOk = values.password.length >= min && values.password.length <= max;
  const providers = (methods?.social ?? [])
    .filter((item) => item.signUp)
    .map((item) => socialProviderView(item.provider));

  const set = (key: keyof SignUpValues) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (nameMissing || emailInvalid || !passwordOk) return;
    onSubmit({
      ...values,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
    });
  };

  const alert = (() => {
    switch (error?.code) {
      case 'userExists':
        return (
          <AuthAlert type="info">
            {t.rich('signUp.userExists', {
              link: (chunks) => <InlineAction onClick={onSignIn}>{chunks}</InlineAction>,
            })}
          </AuthAlert>
        );
      case 'signUpDisabled':
        return (
          <AuthAlert type="warning">
            {t.rich('signUp.signUpDisabled', {
              link: (chunks) => <InlineAction onClick={onCode}>{chunks}</InlineAction>,
            })}
          </AuthAlert>
        );
      case 'rateLimited':
        return <RateLimitAlert error={error} />;
      case 'unavailable':
        return <AuthAlert type="error">{t(copy.unavailable)}</AuthAlert>;
      default:
        return null;
    }
  })();

  const passwordBad = (touched || values.password.length > 0) && !passwordOk;

  return (
    <Screen>
      <ScreenTitle id={titleId} title={t('signUp.title')} />
      {alert}
      <form className={styles.form} aria-labelledby={titleId} onSubmit={submit} noValidate>
        <div className={styles.names}>
          <Field>
            <FloatingLabelInput
              label={t('signUp.firstName')}
              autoComplete="given-name"
              value={values.firstName}
              onChange={set('firstName')}
              status={touched && nameMissing ? 'error' : undefined}
              error={touched && nameMissing ? t('signUp.firstNameMissing') : undefined}
            />
          </Field>
          <Field>
            <FloatingLabelInput
              label={t('signUp.lastName')}
              autoComplete="family-name"
              value={values.lastName}
              onChange={set('lastName')}
            />
          </Field>
        </div>
        <Field>
          <FloatingLabelInput
            label={t('common.email')}
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={set('email')}
            status={(touched && emailInvalid) || error?.code === 'invalidInput' ? 'error' : undefined}
            error={
              (touched && emailInvalid) || error?.code === 'invalidInput'
                ? t('common.invalidEmail')
                : undefined
            }
          />
        </Field>
        <Field>
          <FloatingLabelPassword
            label={t('common.password')}
            autoComplete="new-password"
            value={values.password}
            onChange={set('password')}
            minLength={min}
            maxLength={max}
            status={passwordBad ? 'error' : undefined}
            aria-describedby={rulesId}
            toggleLabels={{
              show: t('common.showPassword'),
              hide: t('common.hidePassword'),
            }}
          />
          <ul id={rulesId} className={styles.rules}>
            <li className={cx(passwordOk ? styles.ok : passwordBad && styles.bad)}>
              {passwordOk ? <CheckOutlined aria-hidden /> : passwordBad ? <CloseOutlined aria-hidden /> : null}
              {t('signUp.passwordRule', { min, max })}
            </li>
          </ul>
        </Field>
        <SubmitButton
          pending={pending}
          pendingLabel={t('common.pending')}
          disabled={waiting > 0 || error?.code === 'signUpDisabled'}
        >
          {t('signUp.submit')}
        </SubmitButton>
      </form>
      {providers.length ? (
        <>
          <Divider {...part('divider')} label={t('common.or')} />
          <SocialButtons
            {...part('social')}
            intent="signUp"
            providers={providers}
            label={t('social.signUpGroup')}
            buttonLabel={(provider) => t('social.signUp', { provider: provider.name })}
            disabled={pending}
            onSelect={onSocial}
          />
        </>
      ) : null}
      <Legal {...part('legal')} links={legalLinks} />
      <Footer>
        {t.rich('signUp.signInPrompt', {
          link: (chunks) => <InlineAction onClick={onSignIn}>{chunks}</InlineAction>,
        })}
      </Footer>
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
  names: css`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${token.paddingSM}px;
  `,
  rules: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXXS}px;
    margin: ${token.marginXXS}px 0 0;
    padding: 0;
    list-style: none;
    font-size: ${token.fontSizeSM}px;
    line-height: ${token.lineHeightSM};
    color: ${token.colorTextSecondary};

    li {
      display: flex;
      align-items: center;
      gap: ${token.marginXXS + 2}px;
    }
  `,
  ok: css`
    color: ${token.colorSuccessText};
  `,
  bad: css`
    color: ${token.colorErrorText};
  `,
}));
