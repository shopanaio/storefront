'use client';

import { Button, Typography } from 'antd';
import type { ButtonProps } from 'antd';
import { InlineLink } from '@shopana/storefront-ui';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import type { AuthError } from '../../core/AuthError';
import { useAuthUI } from '../AuthUIProvider';
import { useRateLimit } from './alerts';
import { formatResend } from './format';

/** The primary action of the screen, full width. */
export const SubmitButton = ({
  pending,
  pendingLabel,
  children,
  ...props
}: ButtonProps & { pending?: boolean; pendingLabel?: ReactNode }) => {
  const { part } = useAuthUI();
  const submit = part('submit', props.className, props.style);
  return (
    <Button
      type="primary"
      size="large"
      block
      htmlType={props.href ? undefined : 'submit'}
      {...props}
      className={submit.className}
      style={submit.style}
      disabled={props.disabled || pending}
      aria-busy={pending || undefined}
    >
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  );
};

/** A text action in the flow ("Forgot password?", "Back to sign in"): an antd link button. */
export const TextAction = ({
  children,
  onClick,
  disabled,
  ariaLabel,
  icon,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  icon?: ReactNode;
}) => {
  const { part } = useAuthUI();
  return (
    <Button
      {...part('textAction')}
      type="link"
      icon={icon}
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
}) => (
  <InlineLink disabled={disabled} onClick={onClick}>
    {children}
  </InlineLink>
);

export interface ResendActionProps {
  onResend: () => void;
  /** "Send again". */
  label: ReactNode;
  /** The last send is still running. */
  pending?: boolean;
  /** Instead of `label` while pending; `label` by default. */
  pendingLabel?: ReactNode;
  /** The error of the last step: a rate limit keeps the action off until it may be tried. */
  error?: AuthError | null;
  /** Seconds until it can be sent again: "Send again in 0:42" instead of the action. */
  resendIn?: number;
  /** Sent again already: the action is off and says `doneLabel`. */
  done?: boolean;
  doneLabel?: ReactNode;
  /** A text button of the flow, a link in a sentence, or a full-width button. */
  appearance?: 'text' | 'inline' | 'button';
}

/** Sends the code or the email again: off while sending, rate-limited or counting down. */
export const ResendAction = ({
  onResend,
  label,
  pending = false,
  pendingLabel,
  error = null,
  resendIn = 0,
  done = false,
  doneLabel,
  appearance = 'text',
}: ResendActionProps) => {
  const t = useTranslations('Auth.common');
  const waiting = useRateLimit(error);
  if (resendIn > 0) {
    return (
      <Typography.Text type="secondary">
        {t('resendIn', { time: formatResend(resendIn) })}
      </Typography.Text>
    );
  }
  const disabled = pending || done || waiting > 0;
  const text = done
    ? (doneLabel ?? label)
    : pending
      ? (pendingLabel ?? label)
      : label;
  switch (appearance) {
    case 'inline':
      return (
        <InlineAction disabled={disabled} onClick={onResend}>
          {text}
        </InlineAction>
      );
    case 'button':
      return (
        <Button
          size="large"
          block
          disabled={disabled}
          aria-busy={pending || undefined}
          onClick={onResend}
        >
          {text}
        </Button>
      );
    default:
      return (
        <TextAction disabled={disabled} onClick={onResend}>
          {text}
        </TextAction>
      );
  }
};
