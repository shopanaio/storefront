'use client';

import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { FloatingLabelPassword } from '@shopana/storefront-ui';
import type { AuthError } from '../../core/AuthError';
import {
  AuthAlert,
  Field,
  InlineAction,
  RateLimitAlert,
  Screen,
  ScreenTitle,
  SubmitButton,
  TextAction,
  useRateLimit,
} from '../common/Screen';
import { ResultScreen } from './ResultScreen';

export interface ResetPasswordScreenProps {
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
  /** Password typed in (stories). */
  defaultPassword?: string;
}

/** The page a reset link opens (`/account/reset-password`): the new password, then sign in. */
export const ResetPasswordScreen = ({
  state,
  minLength,
  maxLength,
  pending,
  error,
  onSubmit,
  onSignIn,
  onRequestNewLink,
  defaultPassword = '',
}: ResetPasswordScreenProps) => {
  const t = useTranslations('Auth');
  const { styles, cx } = useStyles();
  const titleId = useId();
  const rulesId = useId();
  const [password, setPassword] = useState(defaultPassword);
  const [touched, setTouched] = useState(defaultPassword.length > 0);
  const waiting = useRateLimit(error);

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

  const ok = password.length >= minLength && password.length <= maxLength;
  const bad = (touched || error?.code === 'invalidInput') && !ok;
  const linkInvalid = error?.code === 'expired';

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!ok) return;
    onSubmit(password);
  };

  return (
    <Screen>
      <ScreenTitle id={titleId} title={t('reset.title')} subtitle={t('reset.subtitle')} />
      <RateLimitAlert error={error} />
      {linkInvalid ? (
        <AuthAlert type="error">
          {t.rich('reset.linkInvalid', {
            link: (chunks) => (
              <InlineAction onClick={onRequestNewLink}>{chunks}</InlineAction>
            ),
          })}
        </AuthAlert>
      ) : null}
      {error?.code === 'unavailable' ? (
        <AuthAlert type="error">{t('alerts.unavailable')}</AuthAlert>
      ) : null}
      <form className={styles.form} aria-labelledby={titleId} onSubmit={submit} noValidate>
        <Field>
          <FloatingLabelPassword
            label={t('reset.label')}
            autoComplete="new-password"
            value={password}
            minLength={minLength}
            maxLength={maxLength}
            onChange={(event) => {
              setTouched(true);
              setPassword(event.target.value);
            }}
            status={bad ? 'error' : undefined}
            aria-describedby={rulesId}
            toggleLabels={{
              show: t('common.showPassword'),
              hide: t('common.hidePassword'),
            }}
          />
          <ul id={rulesId} className={styles.rules}>
            <li className={cx(ok ? styles.ok : bad && styles.bad)}>
              {ok ? <CheckOutlined aria-hidden /> : bad ? <CloseOutlined aria-hidden /> : null}
              {t('signUp.passwordRule', { min: minLength, max: maxLength })}
            </li>
          </ul>
        </Field>
        <SubmitButton
          pending={pending}
          pendingLabel={t('common.pending')}
          disabled={waiting > 0 || linkInvalid}
        >
          {t('reset.submit')}
        </SubmitButton>
      </form>
      <TextAction onClick={onSignIn}>
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
