'use client';

import { Banner } from '@shopana/storefront-ui';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import type { AuthError } from '../../core/AuthError';
import type { AuthErrorCode } from '../../core/types';
import { useSecondsUntil } from '../../react/useSecondsUntil';
import { useAuthUI } from '../AuthUIProvider';
import { contextCopy, type AuthContext } from '../screens/types';
import { formatWait } from './format';

const BANNER_TONE = {
  info: 'action',
  success: 'success',
  warning: 'warning',
  error: 'critical',
} as const;

/** A message of the sign-in: the storefront banner, the same as the checkout's. */
export const AuthAlert = ({
  type,
  children,
  action,
  id,
}: {
  type: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
  /** One next step, a text link on the right. */
  action?: { label: string; onClick: () => void };
  /** A field the alert is about is described by it. */
  id?: string;
}) => {
  const { part } = useAuthUI();
  const alert = part('alert');
  return (
    <Banner
      id={id}
      tone={BANNER_TONE[type]}
      title={children}
      action={action}
      className={alert.className}
      style={alert.style}
    />
  );
};

/**
 * "Too many attempts. Try again in 12:00." counting down from `retryAfter`; gone once it may be
 * tried again. A form keeps its submit disabled meanwhile with `useRateLimit`.
 */
export const RateLimitAlert = ({ error }: { error: AuthError | null }) => {
  const t = useTranslations('Auth.alerts');
  const left = useRateLimit(error);
  if (!left) return null;
  return (
    <AuthAlert type="warning">
      {t.rich('rateLimited', {
        time: formatWait(left),
        b: (chunks) => <b>{chunks}</b>,
      })}
    </AuthAlert>
  );
};

/** A rate limit without `retryAfter` waits a minute. */
const DEFAULT_RETRY_AFTER = 60;

/** Seconds until a rate-limited action is accepted again; 0 when it is not limited. */
export function useRateLimit(error: AuthError | null): number {
  return useSecondsUntil(
    error?.code === 'rateLimited'
      ? error.occurredAt + (error.retryAfter ?? DEFAULT_RETRY_AFTER) * 1000
      : null
  );
}

/**
 * What a screen shows for an error code instead of the default: an alert of its own, or `null`
 * for none (an error shown under its field).
 */
export type ErrorAlertOverrides = Partial<
  Record<AuthErrorCode, ReactNode | null>
>;

/**
 * The alert of the last error of a screen. Every code has one: the rate limit counts down,
 * `expired`, `deliveryUnavailable` and `methodDisabled` say what happened, `invalidInput` is
 * shown under its field, and any other code says that something went wrong in the words of
 * `context` (the guest checkout offers to check out as a guest). `overrides` replace any of them.
 */
export function useErrorAlert(
  error: AuthError | null,
  context: AuthContext,
  overrides: ErrorAlertOverrides = {}
): ReactNode {
  const t = useTranslations('Auth');
  if (!error) return null;
  const override = overrides[error.code];
  if (override !== undefined) return override;
  switch (error.code) {
    case 'rateLimited':
      return <RateLimitAlert error={error} />;
    case 'expired':
      return <AuthAlert type="warning">{t('alerts.expired')}</AuthAlert>;
    case 'deliveryUnavailable':
      return (
        <AuthAlert type="error">{t('alerts.deliveryUnavailable')}</AuthAlert>
      );
    case 'methodDisabled':
      return <AuthAlert type="error">{t('alerts.methodDisabled')}</AuthAlert>;
    case 'invalidInput':
      return null;
    default:
      return (
        <AuthAlert type="error">
          {t(contextCopy(context).unavailable)}
        </AuthAlert>
      );
  }
}
