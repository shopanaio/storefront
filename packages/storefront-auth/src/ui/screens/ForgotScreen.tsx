'use client';

import { KeyOutlined, MailOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { isEmail } from '@shopana/storefront-ui';
import type { AuthError } from '../../core/AuthError';
import { ResendAction, SubmitButton, TextAction } from '../common/actions';
import { AuthAlert, useErrorAlert, useRateLimit } from '../common/alerts';
import { AuthForm, EmailField, useSubmit } from '../common/form';
import { ScreenTitle } from '../common/heading';
import { Badge, Chip, Screen, Stack } from '../common/layout';
import type { AuthContext, AuthDraft, AuthDraftChange } from './types';

export interface ForgotScreenProps {
  context: AuthContext;
  /** The email typed so far. */
  draft: AuthDraft;
  onDraftChange: AuthDraftChange;
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
  draft,
  onDraftChange,
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
  const titleId = useId();
  const form = useSubmit();
  const waiting = useRateLimit(error);
  const alert = useErrorAlert(error, context);
  const email = draft.email;

  if (sent) {
    return (
      <Screen>
        <Badge icon={<MailOutlined />} />
        <ScreenTitle
          title={t('forgot.sentTitle')}
          subtitle={t('forgot.sentSubtitle')}
        />
        <Chip
          value={email.trim()}
          action={{
            label: t('common.change'),
            ariaLabel: t('common.changeEmail'),
            onClick: onChangeEmail,
          }}
        />
        {resent && !error ? (
          <AuthAlert type="info">{t('forgot.resent')}</AuthAlert>
        ) : null}
        {alert}
        <Stack>
          <SubmitButton htmlType="button" onClick={onBackToSignIn}>
            {t('common.backToSignIn')}
          </SubmitButton>
        </Stack>
        <span className={styles.links}>
          <Typography.Text type="secondary">
            {t('forgot.notReceived')}
          </Typography.Text>
          <ResendAction
            onResend={onResend}
            label={t('forgot.resend')}
            pending={pending}
            pendingLabel={t('forgot.resendPending')}
            error={error}
          />
        </span>
      </Screen>
    );
  }

  return (
    <Screen>
      <Badge icon={<KeyOutlined />} />
      <ScreenTitle
        id={titleId}
        title={t('forgot.title')}
        subtitle={t('forgot.subtitle')}
      />
      {alert}
      <AuthForm
        labelledBy={titleId}
        onSubmit={() =>
          form.submit(isEmail(email), () => onSubmit(email.trim()))
        }
      >
        <EmailField
          value={email}
          onChange={(next) => onDraftChange({ email: next })}
          submitted={form.submitted}
          error={error}
        />
        <SubmitButton
          pending={pending}
          pendingLabel={t('common.pending')}
          disabled={waiting > 0}
        >
          {t('forgot.submit')}
        </SubmitButton>
      </AuthForm>
      <TextAction onClick={onBackToSignIn}>
        {t('common.backToSignIn')}
      </TextAction>
    </Screen>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  links: css`
    display: inline-flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: ${token.marginXS}px;
  `,
}));
