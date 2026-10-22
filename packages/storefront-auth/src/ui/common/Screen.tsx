'use client';

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Alert, Avatar, Button, Spin, Typography } from 'antd';
import type { ButtonProps } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import type { CSSProperties, ReactNode } from 'react';
import { useAuthUI } from '../AuthUIProvider';
import type { AuthError } from '../../core/AuthError';
import { formatWait } from './format';
import { useCountdown } from './useCountdown';

/** One centered column of a screen: the layout every sign-in screen shares. */
export const Screen = ({
  children,
  busy,
}: {
  children: ReactNode;
  /** The screen only reports progress ("Signing in…"): announced politely. */
  busy?: boolean;
}) => {
  const { styles } = useStyles();
  const { part } = useAuthUI();
  const root = part('root', styles.root);
  return (
    <div
      className={root.className}
      style={root.style}
      role={busy ? 'status' : undefined}
      aria-live={busy ? 'polite' : undefined}
    >
      {children}
    </div>
  );
};

/** Title and the line under it; `id` names the form it heads. */
export const ScreenTitle = ({
  id,
  title,
  subtitle,
}: {
  id?: string;
  title: ReactNode;
  subtitle?: ReactNode;
}) => {
  const { styles } = useStyles();
  const { part } = useAuthUI();
  const titlePart = part('title', styles.title);
  return (
    <div className={styles.head}>
      <Typography.Title
        level={2}
        id={id}
        className={titlePart.className}
        style={titlePart.style}
      >
        {title}
      </Typography.Title>
      {subtitle ? (
        <Typography.Text type="secondary" className={styles.subtitle}>
          {subtitle}
        </Typography.Text>
      ) : null}
    </div>
  );
};

/** Round badge with the icon of the step (an envelope, a phone, a check). */
export const Badge = ({
  icon,
  tone = 'info',
}: {
  icon: ReactNode;
  tone?: 'info' | 'success' | 'warning';
}) => {
  const { styles, cx } = useStyles();
  return (
    <span
      className={cx(
        styles.badge,
        tone === 'success' && styles.badgeSuccess,
        tone === 'warning' && styles.badgeWarning
      )}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
};

const ALERT_ICONS = {
  info: <InfoCircleOutlined />,
  success: <CheckCircleOutlined />,
  // Warnings of the sign-in are about time: a session, an attempt limit, a spent sign-in.
  warning: <ClockCircleOutlined />,
  error: <ExclamationCircleOutlined />,
};

export const AuthAlert = ({
  type,
  children,
  action,
  icon,
}: {
  type: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
  action?: ReactNode;
  /** Replaces the outline icon of the type, e.g. an envelope for an email to follow. */
  icon?: ReactNode;
}) => {
  const { styles } = useStyles();
  const { part } = useAuthUI();
  const alert = part('alert', styles.alert);
  return (
    <Alert
      showIcon
      icon={icon ?? ALERT_ICONS[type]}
      type={type}
      role={type === 'error' || type === 'warning' ? 'alert' : 'status'}
      className={alert.className}
      style={alert.style}
      title={children}
      action={action}
    />
  );
};

/**
 * "Too many attempts. Try again in 12:00." counting down from `retryAfter`; gone once it may be
 * tried again. `onActive` tells the form whether to keep its submit disabled.
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

/** Seconds until a rate-limited action is accepted again; 0 when it is not limited. */
export function useRateLimit(error: AuthError | null): number {
  const limited = error?.code === 'rateLimited';
  const left = useCountdown(limited ? (error.retryAfter ?? 60) : undefined, error);
  return limited ? left : 0;
}

/** Field wrapper: the `field` part of the theme. */
export const Field = ({ children }: { children: ReactNode }) => {
  const { styles } = useStyles();
  const { part } = useAuthUI();
  const field = part('field', styles.field);
  return (
    <div className={field.className} style={field.style}>
      {children}
    </div>
  );
};

/** The primary action of the screen, full width. */
export const SubmitButton = ({
  pending,
  pendingLabel,
  children,
  ...props
}: ButtonProps & { pending?: boolean; pendingLabel?: ReactNode }) => {
  const { part } = useAuthUI();
  const submit = part('submit', props.className);
  return (
    <Button
      type="primary"
      size="large"
      block
      htmlType={props.href ? undefined : 'submit'}
      {...props}
      className={submit.className}
      style={{ ...props.style, ...submit.style }}
      disabled={props.disabled || pending}
      aria-busy={pending || undefined}
    >
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  );
};

/** A text action in the flow ("Forgot password?", "Back to sign in"). */
export const TextAction = ({
  children,
  onClick,
  disabled,
  strong,
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  strong?: boolean;
  ariaLabel?: string;
}) => {
  const { styles, cx } = useStyles();
  return (
    <Button
      type="link"
      className={cx(styles.textAction, strong && styles.strong)}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

/** A link inside a sentence of an alert or the footer. */
export const InlineAction = ({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) => {
  const { styles } = useStyles();
  return (
    <Button
      type="link"
      className={styles.inlineAction}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

/** Where the code or the link went, with its change action. */
export const Chip = ({
  value,
  action,
}: {
  value: ReactNode;
  action?: { label: ReactNode; ariaLabel?: string; onClick: () => void };
}) => {
  const { styles, cx } = useStyles();
  return (
    <span className={cx(styles.chip, !action && styles.chipBare)}>
      <span className={styles.chipValue}>{value}</span>
      {action ? (
        <Button
          size="small"
          shape="round"
          className={styles.chipAction}
          aria-label={action.ariaLabel}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ) : null}
    </span>
  );
};

/** The `footer` part: the line at the end of a store card ("Want a password? Sign up"). */
export const Footer = ({ children }: { children: ReactNode }) => {
  const { styles } = useStyles();
  const { part } = useAuthUI();
  const footer = part('footer', styles.footer);
  return (
    <Typography.Text
      type="secondary"
      className={footer.className}
      style={footer.style}
    >
      {children}
    </Typography.Text>
  );
};

/** "Signing in…" with the buyer's initial, or a spinner until the name is known. */
export const SigningIn = ({
  initial,
  destination,
  title,
}: {
  initial: string | null;
  destination?: string;
  title: string;
}) => {
  const { styles } = useStyles();
  return (
    <Screen busy>
      {initial ? (
        <Avatar size={56} className={styles.avatar} aria-hidden="true">
          {initial}
        </Avatar>
      ) : (
        <Spin size="large" />
      )}
      <ScreenTitle title={title} subtitle={destination} />
    </Screen>
  );
};

export const Stack = ({
  children,
  gap,
  style,
}: {
  children: ReactNode;
  gap?: 'small' | 'middle';
  style?: CSSProperties;
}) => {
  const { styles, cx } = useStyles();
  return (
    <div className={cx(styles.stack, gap === 'middle' && styles.stackMiddle)} style={style}>
      {children}
    </div>
  );
};

export const useStyles = createStyles(({ css, token }) => ({
  root: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${token.padding}px;
    width: 100%;
    max-width: 380px;
    margin: 0 auto;
    text-align: center;
  `,
  head: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXXS}px;
  `,
  title: css`
    && {
      margin: 0;
      font-size: ${token.fontSizeHeading3}px;
      line-height: ${token.lineHeightHeading3};
    }
  `,
  subtitle: css`
    font-size: ${token.fontSize}px;
  `,
  badge: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    font-size: ${token.fontSizeHeading3}px;
    background: ${token.colorPrimaryBg};
    color: ${token.colorPrimary};
  `,
  badgeSuccess: css`
    background: ${token.colorSuccessBg};
    color: ${token.colorSuccess};
  `,
  badgeWarning: css`
    background: ${token.colorWarningBg};
    color: ${token.colorWarning};
  `,
  // The icon stands at the first line of a long message.
  alert: css`
    && {
      width: 100%;
      align-items: flex-start;
      text-align: left;
    }

    .ant-alert-icon {
      margin-top: ${(token.fontSize * token.lineHeight - token.fontSize) / 2 + 1}px;
    }
  `,
  field: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXXS}px;
    width: 100%;
    text-align: left;
  `,
  stack: css`
    display: flex;
    flex-direction: column;
    gap: ${token.paddingSM}px;
    width: 100%;
    margin: 0;
    text-align: left;
  `,
  stackMiddle: css`
    gap: ${token.padding}px;
  `,
  textAction: css`
    && {
      height: auto;
      padding: 0;
    }
  `,
  strong: css`
    font-weight: ${token.fontWeightStrong};
  `,
  inlineAction: css`
    && {
      height: auto;
      padding: 0;
      font-weight: ${token.fontWeightStrong};
      vertical-align: baseline;
    }
  `,
  chip: css`
    display: inline-flex;
    align-items: center;
    gap: ${token.marginXS}px;
    max-width: 100%;
    height: 36px;
    padding: 0 ${token.marginXXS + 2}px 0 ${token.paddingSM + 2}px;
    border-radius: 999px;
    background: ${token.colorFillTertiary};
    font-size: ${token.fontSize}px;
  `,
  chipBare: css`
    padding-right: ${token.paddingSM + 2}px;
  `,
  chipValue: css`
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: ${token.fontWeightStrong};
    color: ${token.colorText};
  `,
  chipAction: css`
    && {
      border: 0;
      box-shadow: none;
      background: ${token.colorBgContainer};
      color: ${token.colorPrimary};
      font-weight: ${token.fontWeightStrong};
    }
  `,
  footer: css`
    display: block;
    margin-top: auto;
    text-align: center;
  `,
  avatar: css`
    && {
      background: ${token.colorPrimaryBg};
      color: ${token.colorPrimary};
      font-size: ${token.fontSizeHeading4}px;
      font-weight: ${token.fontWeightStrong};
    }
  `,
}));
