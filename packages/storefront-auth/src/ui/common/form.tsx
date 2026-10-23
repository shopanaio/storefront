'use client';

import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { FloatingLabelInput, isEmail } from '@shopana/storefront-ui';
import type { AuthError } from '../../core/AuthError';
import { useAuthUI, type PasswordRule } from '../AuthUIProvider';
import { useScreenPreset } from './preset';

/**
 * The submit of a screen's form: `submitted` turns on with the first try, so the fields show
 * what does not pass only then; `submit(valid, send)` sends the form when it passes.
 */
export function useSubmit() {
  const preset = useScreenPreset();
  const [submitted, setSubmitted] = useState(Boolean(preset.submitted));
  return {
    submitted,
    submit: (valid: boolean, send: () => void) => {
      setSubmitted(true);
      if (valid) send();
    },
    /** Forgets the try, e.g. when the form switches to another field. */
    reset: () => setSubmitted(false),
  };
}

/** The form of a screen, named by its title; the browser's own validation is off. */
export const AuthForm = ({
  labelledBy,
  onSubmit,
  gap = 'small',
  children,
}: {
  /** Id of the title of the screen. */
  labelledBy?: string;
  onSubmit: () => void;
  gap?: 'small' | 'middle';
  children: ReactNode;
}) => {
  const { styles, cx } = useStyles();
  const { part } = useAuthUI();
  const form = part(
    'form',
    cx(styles.form, gap === 'middle' && styles.formMiddle)
  );
  return (
    <form
      className={form.className}
      style={form.style}
      aria-labelledby={labelledBy}
      noValidate
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {children}
    </form>
  );
};

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

/** The email of a form: invalid once submitted, or when the server refused it. */
export const EmailField = ({
  value,
  onChange,
  submitted,
  error,
  autoComplete = 'email',
}: {
  value: string;
  onChange: (value: string) => void;
  submitted: boolean;
  /** The last error of the screen: `invalidInput` marks the email invalid. */
  error: AuthError | null;
  /** `username` on a password sign-in, so password managers pair it with the password. */
  autoComplete?: 'email' | 'username';
}) => {
  const t = useTranslations('Auth.common');
  const invalid =
    (submitted && !isEmail(value)) || error?.code === 'invalidInput';
  return (
    <Field>
      <FloatingLabelInput
        label={t('email')}
        type="email"
        inputMode="email"
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={invalid ? t('invalidEmail') : undefined}
      />
    </Field>
  );
};

/**
 * The length rule of a new password: whether it passes, whether to show it failed (typed or
 * submitted), and the rule for the `PasswordRules` part.
 */
export function usePasswordRules(
  password: string,
  {
    minLength,
    maxLength,
    submitted,
  }: { minLength: number; maxLength: number; submitted: boolean }
) {
  const t = useTranslations('Auth.common');
  const valid = password.length >= minLength && password.length <= maxLength;
  const checked = submitted || password.length > 0;
  const failed = checked && !valid;
  const rules: PasswordRule[] = [
    {
      key: 'length',
      label: t('passwordRule', { min: minLength, max: maxLength }),
      state: valid ? 'passed' : failed ? 'failed' : 'pending',
    },
  ];
  return { valid, failed, rules };
}

const useStyles = createStyles(({ css, token }) => ({
  form: css`
    display: flex;
    flex-direction: column;
    gap: ${token.paddingSM}px;
    width: 100%;
    margin: 0;
    text-align: left;
  `,
  formMiddle: css`
    gap: ${token.padding}px;
  `,
  field: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXXS}px;
    width: 100%;
    text-align: left;
  `,
}));
