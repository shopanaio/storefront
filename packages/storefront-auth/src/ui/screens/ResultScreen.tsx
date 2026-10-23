'use client';

import { MailOutlined } from '@ant-design/icons';
import { Spin, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import type { ReactNode } from 'react';
import type { AuthError } from '../../core/AuthError';
import { ResendAction, SubmitButton } from '../common/actions';
import { AuthAlert, useErrorAlert } from '../common/alerts';
import { ScreenTitle } from '../common/heading';
import { Badge, Chip, MediaCircle, Screen, Stack } from '../common/layout';
import { socialProviderView } from '../parts/providers';
import type { AuthContext } from './types';

/** A badge with the icon of the step, or media of its own (a provider logo) in its place. */
type ResultMedia =
  | {
      /** Badge over the title. */
      icon: ReactNode;
      tone?: 'info' | 'success' | 'warning';
      media?: undefined;
    }
  | {
      /** Replaces the badge, e.g. a provider logo. */
      media: ReactNode;
      icon?: undefined;
      tone?: undefined;
    };

export type ResultScreenProps = ResultMedia & {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Id of the title, for a form in `actions` it heads; one of its own by default. */
  titleId?: string;
  /** Where the email went, with its change action. */
  chip?: ReactNode;
  alerts?: ReactNode;
  /** Buttons of the outcome, full width. */
  actions?: ReactNode;
  /** Small note at the end ("Check the spam folder"). */
  hint?: ReactNode;
  /** The screen only reports progress. */
  busy?: boolean;
};

/** The outcome of a step: an email to follow, a redirect, a confirmed address, a spent link. */
export const ResultScreen = ({
  icon,
  tone = 'info',
  media,
  title,
  subtitle,
  titleId,
  chip,
  alerts,
  actions,
  hint,
  busy,
}: ResultScreenProps) => {
  const { styles } = useStyles();
  const ownId = useId();
  return (
    <Screen busy={busy}>
      {media ?? <Badge icon={icon} tone={tone} />}
      <ScreenTitle id={titleId ?? ownId} title={title} subtitle={subtitle} />
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
  context: AuthContext;
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
  context,
  email,
  sent,
  pending,
  error,
  onSignIn,
  onResend,
  onChangeEmail,
}: VerifyEmailLinkScreenProps) => {
  const t = useTranslations('Auth');
  const alert = useErrorAlert(error, context);
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
          {sent && !error ? (
            <AuthAlert type="info">{t('verifyLink.sent')}</AuthAlert>
          ) : null}
          {alert}
        </>
      }
      actions={
        <>
          <SubmitButton htmlType="button" onClick={onSignIn}>
            {t('common.signIn')}
          </SubmitButton>
          <ResendAction
            appearance="button"
            onResend={onResend}
            label={t('verifyLink.resend')}
            pending={pending}
            pendingLabel={t('common.pending')}
            error={error}
          />
        </>
      }
      hint={t('verifyLink.hint')}
    />
  );
};

export interface SocialRedirectScreenProps {
  provider: string;
}

/** The browser leaves for the provider: "Going to Google…". */
export const SocialRedirectScreen = ({
  provider,
}: SocialRedirectScreenProps) => {
  const t = useTranslations('Auth.social');
  const { styles } = useStyles();
  const view = socialProviderView(provider);
  return (
    <ResultScreen
      busy
      media={
        <span className={styles.redirect} aria-hidden="true">
          <MediaCircle outlined>{view.icon}</MediaCircle>
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
}));
