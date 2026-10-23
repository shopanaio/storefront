'use client';

import { MailOutlined, MobileOutlined } from '@ant-design/icons';
import { Spin, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import { formatPhoneInternational } from '@shopana/storefront-ui';
import type { AuthError } from '../../core/AuthError';
import type { OtpChannel } from '../../core/types';
import { ResendAction } from '../common/actions';
import { AuthAlert, useErrorAlert } from '../common/alerts';
import { CodeCells } from '../common/CodeCells';
import { ScreenTitle } from '../common/heading';
import { Badge, Chip, Screen } from '../common/layout';
import { useScreenPreset } from '../common/preset';
import type { AuthContext, OtpPurpose } from './types';

export interface CodeScreenProps {
  context: AuthContext;
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
  onVerify: (code: string) => void;
  onResend: () => void;
  /** Back to change the email or the number. */
  onChange: () => void;
}

/**
 * The code: six cells, sent once all are filled — or as soon as the step before it is done —
 * with a countdown to sending it again.
 */
export const CodeScreen = ({
  context,
  purpose,
  channel,
  destination,
  codeLength,
  resendIn,
  signUpWithCode,
  pending,
  error,
  onVerify,
  onResend,
  onChange,
}: CodeScreenProps) => {
  const t = useTranslations('Auth');
  const { styles } = useStyles();
  const preset = useScreenPreset();
  const titleId = useId();
  const errorId = useId();
  const [code, setCode] = useState(preset.code ?? '');
  const [shownError, setShownError] = useState<AuthError | null>(error);
  const [lastError, setLastError] = useState<AuthError | null>(error);
  // The last code sent; a code typed in before (a story's) counts as sent.
  const submitted = useRef<string | null>(
    code.length === codeLength ? code : null
  );

  // An error stays until the buyer types again; a wrong code is cleared for the next one.
  if (error !== lastError) {
    setLastError(error);
    setShownError(error);
    if (error?.code === 'invalidCredentials') setCode('');
  }

  // A complete code is sent once; typed while a step was still running, it goes when it ends.
  useEffect(() => {
    if (code.length < codeLength) {
      submitted.current = null;
      return;
    }
    if (pending || submitted.current === code) return;
    submitted.current = code;
    onVerify(code);
  }, [code, codeLength, pending, onVerify]);

  const shown =
    channel === 'phone' ? formatPhoneInternational(destination) : destination;
  const verifyEmail = purpose === 'verifyEmail';
  const wrong = shownError?.code === 'invalidCredentials';
  const limited = error?.code === 'rateLimited';
  const off = limited || error?.code === 'unavailable';
  const verifying = pending && code.length === codeLength;
  const wrongText =
    verifyEmail || signUpWithCode
      ? t('code.invalid')
      : channel === 'email'
        ? t('code.invalidNoSignUpEmail')
        : t('code.invalidNoSignUpPhone');

  const alert = useErrorAlert(error, context, {
    // Told under the cells.
    invalidCredentials: null,
    deliveryUnavailable: (
      <AuthAlert type="error">
        {t('alerts.deliveryUnavailableResend')}
      </AuthAlert>
    ),
  });

  const change = (next: string) => {
    setCode(next);
    if (shownError?.code === 'invalidCredentials') setShownError(null);
  };

  return (
    <Screen>
      <Badge
        icon={
          channel === 'email' || verifyEmail ? (
            <MailOutlined />
          ) : (
            <MobileOutlined />
          )
        }
      />
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
          ariaLabel:
            channel === 'phone'
              ? t('common.changePhone')
              : t('common.changeEmail'),
          onClick: onChange,
        }}
      />
      {alert}
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
      <ResendAction
        onResend={onResend}
        label={t('code.resend')}
        pending={pending}
        error={error}
        resendIn={resendIn}
      />
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
