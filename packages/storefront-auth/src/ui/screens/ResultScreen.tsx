'use client';

import { MailOutlined } from '@ant-design/icons';
import { Button, Spin, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import type { AuthError } from '../../core/AuthError';
import {
  AuthAlert,
  Badge,
  Chip,
  RateLimitAlert,
  Screen,
  ScreenTitle,
  Stack,
  SubmitButton,
  useRateLimit,
} from '../common/Screen';
import { socialProviderView } from '../parts/providers';

export interface ResultScreenProps {
  /** Badge over the title; with `busy`, a spinner beside it. */
  icon: ReactNode;
  tone?: 'info' | 'success' | 'warning';
  title: ReactNode;
  subtitle?: ReactNode;
  /** Where the email went, with its change action. */
  chip?: ReactNode;
  alerts?: ReactNode;
  /** Buttons of the outcome, full width. */
  actions?: ReactNode;
  /** Small note at the end ("Check the spam folder"). */
  hint?: ReactNode;
  /** The screen only reports progress. */
  busy?: boolean;
  /** Replaces the badge, e.g. a provider logo. */
  media?: ReactNode;
}

/** The outcome of a step: an email to follow, a redirect, a confirmed address, a spent link. */
export const ResultScreen = ({
  icon,
  tone = 'info',
  title,
  subtitle,
  chip,
  alerts,
  actions,
  hint,
  busy,
  media,
}: ResultScreenProps) => {
  const { styles } = useStyles();
  return (
    <Screen busy={busy}>
      {media ?? <Badge icon={icon} tone={tone} />}
      <ScreenTitle title={title} subtitle={subtitle} />
      {chip}
      {alerts}
      {actions ? <Stack>{actions}</Stack> : null}
      {hint ? (
        <Typography.Text type="secondary" className={styles.hint}>
          {hint}
        </Typography.Text>
      ) : null}
    </Screen>
  );
};

export interface VerifyEmailLinkScreenProps {
  email: string;
  /** The email was sent again. */
  sent: boolean;
  pending: boolean;
  error: AuthError | null;
  onSignIn: () => void;
  onResend: () => void;
  onChangeEmail: () => void;
}

/** The account waits for the link in its email: follow it and sign in. */
export const VerifyEmailLinkScreen = ({
  email,
  sent,
  pending,
  error,
  onSignIn,
  onResend,
  onChangeEmail,
}: VerifyEmailLinkScreenProps) => {
  const t = useTranslations('Auth');
  const waiting = useRateLimit(error);
  return (
    <ResultScreen
      icon={<MailOutlined />}
      title={t('verifyLink.title')}
      subtitle={t('verifyLink.subtitle')}
      chip={
        <Chip
          value={email}
          action={{
            label: t('common.change'),
            ariaLabel: t('common.changeEmail'),
            onClick: onChangeEmail,
          }}
        />
      }
      alerts={
        <>
          {sent && !error ? <AuthAlert type="info">{t('verifyLink.sent')}</AuthAlert> : null}
          <RateLimitAlert error={error} />
          {error?.code === 'unavailable' ? (
            <AuthAlert type="error">{t('alerts.unavailable')}</AuthAlert>
          ) : null}
        </>
      }
      actions={
        <>
          <SubmitButton htmlType="button" onClick={onSignIn}>
            {t('common.signIn')}
          </SubmitButton>
          <Button
            size="large"
            block
            disabled={pending || waiting > 0}
            aria-busy={pending || undefined}
            onClick={onResend}
          >
            {pending ? t('common.pending') : t('verifyLink.resend')}
          </Button>
        </>
      }
      hint={t('verifyLink.hint')}
    />
  );
};

/** The browser leaves for the provider: "Going to Google…". */
export const SocialRedirectScreen = ({ provider }: { provider: string }) => {
  const t = useTranslations('Auth.social');
  const { styles } = useStyles();
  const view = socialProviderView(provider);
  return (
    <ResultScreen
      busy
      icon={null}
      media={
        <span className={styles.redirect} aria-hidden="true">
          <span className={styles.logo}>{view.icon}</span>
          <Spin size="large" />
        </span>
      }
      title={t('redirectTitle', { provider: view.name })}
      subtitle={t('redirectSubtitle', { provider: view.name })}
    />
  );
};

const useStyles = createStyles(({ css, token }) => ({
  hint: css`
    font-size: ${token.fontSizeSM}px;
  `,
  redirect: css`
    display: inline-flex;
    align-items: center;
    gap: ${token.padding}px;
  `,
  logo: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border: ${token.lineWidth}px solid ${token.colorBorder};
    border-radius: 50%;
    background: ${token.colorBgContainer};
    font-size: ${token.fontSizeHeading3}px;
  `,
}));
