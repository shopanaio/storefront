'use client';

import { MailOutlined, MobileOutlined } from '@ant-design/icons';
import { Spin, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useId, useRef, useState } from 'react';
import { formatPhoneNumberIntl } from '@shopana/storefront-ui';
import type { AuthError } from '../../core/AuthError';
import type { OtpChannel } from '../../core/types';
import { CodeCells } from '../common/CodeCells';
import { formatResend } from '../common/format';
import {
  AuthAlert,
  Badge,
  Chip,
  RateLimitAlert,
  Screen,
  ScreenTitle,
  SigningIn,
  TextAction,
} from '../common/Screen';
import type { OtpPurpose } from './types';

export interface CodeScreenProps {
  /** A code to sign in, or to confirm the email of a password account. */
  purpose: OtpPurpose;
  channel: OtpChannel;
  /** Where the code went: the email or the E.164 phone. */
  destination: string;
  codeLength: number;
  /** Seconds until the code can be sent again. */
  resendIn: number;
  /**
   * A new buyer can sign up with this code. Without it a right code of an unknown buyer is
   * refused like a wrong one, and the error says so.
   */
  signUpWithCode: boolean;
  pending: boolean;
  error: AuthError | null;
  /** Signed in: "Signing in…" with the buyer's initial, a spinner until it is known. */
  signingIn?: { initial: string | null } | null;
  onVerify: (code: string) => void;
  onResend: () => void;
  /** Back to change the email or the number. */
  onChange: () => void;
  /** Code typed in (stories). */
  defaultCode?: string;
}

/** The code: six cells, sent once all are filled, with a countdown to sending it again. */
export const CodeScreen = ({
  purpose,
  channel,
  destination,
  codeLength,
  resendIn,
  signUpWithCode,
  pending,
  error,
  signingIn,
  onVerify,
  onResend,
  onChange,
  defaultCode = '',
}: CodeScreenProps) => {
  const t = useTranslations('Auth');
  const { styles } = useStyles();
  const titleId = useId();
  const errorId = useId();
  const [code, setCode] = useState(defaultCode);
  const [shownError, setShownError] = useState<AuthError | null>(error);
  const [lastError, setLastError] = useState<AuthError | null>(error);
  const submitted = useRef<string | null>(defaultCode.length === codeLength ? defaultCode : null);

  // An error stays until the buyer changes the code.
  if (error !== lastError) {
    setLastError(error);
    setShownError(error);
  }

  const shown =
    channel === 'phone' ? formatPhoneNumberIntl(destination) || destination : destination;

  if (signingIn) {
    return <SigningIn initial={signingIn.initial} destination={shown} title={t('code.signingIn')} />;
  }

  const verifyEmail = purpose === 'verifyEmail';
  const wrong = shownError?.code === 'invalidCredentials';
  const limited = error?.code === 'rateLimited';
  const off = limited || error?.code === 'unavailable';
  const verifying = pending && code.length === codeLength;
  const wrongText = verifyEmail || signUpWithCode
    ? t('code.invalid')
    : channel === 'email'
      ? t('code.invalidNoSignUpEmail')
      : t('code.invalidNoSignUpPhone');

  const change = (next: string) => {
    setCode(next);
    if (shownError?.code === 'invalidCredentials') setShownError(null);
    if (next.length === codeLength && submitted.current !== next && !pending) {
      submitted.current = next;
      onVerify(next);
    }
    if (next.length < codeLength) submitted.current = null;
  };

  return (
    <Screen>
      <Badge icon={channel === 'email' || verifyEmail ? <MailOutlined /> : <MobileOutlined />} />
      <ScreenTitle
        id={titleId}
        title={verifyEmail ? t('code.titleVerifyEmail') : t('code.title')}
        subtitle={
          channel === 'email' || verifyEmail
            ? t('code.sentEmail', { length: codeLength })
            : t('code.sentPhone', { length: codeLength })
        }
      />
      <Chip
        value={shown}
        action={{
          label: t('common.change'),
          ariaLabel: channel === 'phone' ? t('common.changePhone') : t('common.changeEmail'),
          onClick: onChange,
        }}
      />
      {limited ? <RateLimitAlert error={error} /> : null}
      {error?.code === 'deliveryUnavailable' ? (
        <AuthAlert type="error">{t('alerts.deliveryUnavailableResend')}</AuthAlert>
      ) : null}
      {error?.code === 'unavailable' ? (
        <AuthAlert type="error">{t('alerts.unavailable')}</AuthAlert>
      ) : null}
      <CodeCells
        length={codeLength}
        value={code}
        onChange={change}
        autoFocus
        label={t('code.label', { length: codeLength })}
        state={wrong ? 'error' : off ? 'off' : verifying ? 'verifying' : 'idle'}
        aria-describedby={wrong ? errorId : undefined}
      />
      {verifying ? (
        <span className={styles.status} role="status">
          <Spin size="small" />
          {t('code.verifying')}
        </span>
      ) : null}
      {wrong ? (
        <Typography.Text type="danger" id={errorId} role="alert">
          {wrongText}
        </Typography.Text>
      ) : null}
      {resendIn > 0 ? (
        <Typography.Text type="secondary">
          {t('code.resendIn', { time: formatResend(resendIn) })}
        </Typography.Text>
      ) : (
        <TextAction onClick={onResend} disabled={pending || limited}>
          {t('code.resend')}
        </TextAction>
      )}
    </Screen>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  status: css`
    display: inline-flex;
    align-items: center;
    gap: ${token.marginXS}px;
    color: ${token.colorTextSecondary};
  `,
}));
