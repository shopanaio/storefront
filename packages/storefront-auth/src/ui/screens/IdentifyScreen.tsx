'use client';

import { LockOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import type { ReactNode } from 'react';
import {
  FLOATING_FIELD_HEIGHT,
  FloatingLabelInput,
  isEmail,
  isPossiblePhone,
  PhoneInput,
  VisuallyHidden,
} from '@shopana/storefront-ui';
import type { AuthError } from '../../core/AuthError';
import type { AuthMethods } from '../../core/types';
import { useAuthUI, type AuthMethodTab } from '../AuthUIProvider';
import { SubmitButton, TextAction } from '../common/actions';
import { AuthAlert, useErrorAlert, useRateLimit } from '../common/alerts';
import { AuthForm, Field, useSubmit } from '../common/form';
import { ScreenTitle } from '../common/heading';
import { Screen, Stack } from '../common/layout';
import { useScreenPreset } from '../common/preset';
import { socialProviderView } from '../parts/providers';
import {
  contextCopy,
  type AuthContext,
  type AuthDraft,
  type AuthDraftChange,
  type IdentifyNotice,
} from './types';

export interface IdentifyScreenProps {
  context: AuthContext;
  /** Configuration of the methods is loading, ready, or could not be read. */
  status: 'loading' | 'ready' | 'unavailable';
  methods: AuthMethods | null;
  /** The channel, the phone and the email typed so far. */
  draft: AuthDraft;
  onDraftChange: AuthDraftChange;
  pending: boolean;
  error: AuthError | null;
  notice: IdentifyNotice | null;
  /** Sends a code to the phone or the email. */
  onSubmit: (channel: AuthMethodTab, destination: string) => void;
  onPassword: () => void;
  onSocial: (provider: string) => void;
  /** Reads the methods again when they could not be read; no retry without it. */
  onRetry?: () => void;
  /**
   * The line under the title, in the host's words: the checkout says what the order earns once
   * the buyer signs in. The default line of the context otherwise.
   */
  subtitle?: ReactNode;
}

const NOTICE_ALERTS: Record<IdentifyNotice, 'warning' | 'error'> = {
  sessionExpired: 'warning',
  socialCancelled: 'warning',
  socialFailed: 'error',
  accountNotLinked: 'warning',
};

/**
 * First screen: a one-time code to the phone or the email, a password, social providers — as
 * the store has them enabled. Phone | Email tabs only when both codes are on; the password is a
 * link next to a code and the main button without one.
 */
export const IdentifyScreen = ({
  context,
  status,
  methods,
  draft,
  onDraftChange,
  pending,
  error,
  notice,
  onSubmit,
  onPassword,
  onSocial,
  onRetry,
  subtitle,
}: IdentifyScreenProps) => {
  const t = useTranslations('Auth');
  const { styles } = useStyles();
  const { components, legalLinks, part } = useAuthUI();
  const { MethodTabs, Divider, SocialButtons, Legal } = components;
  const preset = useScreenPreset();
  const copy = contextCopy(context);
  const titleId = useId();
  const waiting = useRateLimit(error);

  const accountsDisabled = error?.code === 'disabled';
  const blocked = status === 'loading' || accountsDisabled;
  const phoneCode = Boolean(methods?.phoneOtp.signIn) && !blocked;
  const emailCode = Boolean(methods?.emailOtp.signIn) && !blocked;
  const hasCode = phoneCode || emailCode;
  const withPassword = Boolean(methods?.password.signIn) && !blocked;
  const providers = blocked
    ? []
    : (methods?.social ?? []).map((item) => socialProviderView(item.provider));
  const channel: AuthMethodTab =
    phoneCode && emailCode ? draft.channel : phoneCode ? 'phone' : 'email';
  const valid =
    channel === 'phone' ? isPossiblePhone(draft.phone) : isEmail(draft.email);
  const form = useSubmit();
  const invalid = (form.submitted && !valid) || error?.code === 'invalidInput';
  const invalidText =
    channel === 'phone' ? t('common.invalidPhone') : t('common.invalidEmail');

  const errorAlert = useErrorAlert(error, context, {
    disabled: <AuthAlert type="info">{t(copy.accountsDisabled)}</AuthAlert>,
    // The configuration could not be read: it can be read again.
    unavailable:
      status === 'unavailable' && onRetry ? (
        <AuthAlert
          type="error"
          action={{ label: t('common.retry'), onClick: onRetry }}
        >
          {t(copy.unavailable)}
        </AuthAlert>
      ) : undefined,
  });

  return (
    <Screen>
      <ScreenTitle
        id={titleId}
        title={copy.identifyTitle ? t(copy.identifyTitle) : undefined}
        subtitle={
          subtitle ??
          (() => {
            const key = copy.identifySubtitle(hasCode || status === 'loading');
            return key ? t(key) : undefined;
          })()
        }
        // Without a title of its own the line is the text of the page section it sits in.
        align={copy.identifyTitle ? 'center' : 'start'}
      />
      {notice && !blocked ? (
        <AuthAlert type={NOTICE_ALERTS[notice]}>
          {t(`alerts.${notice}`)}
        </AuthAlert>
      ) : null}
      {status === 'loading' ? null : errorAlert}
      {status === 'loading' ? (
        <Stack>
          <Skeleton.Button
            active
            block
            size="large"
            className={styles.skeleton}
          />
          <Skeleton.Button
            active
            block
            size="large"
            className={styles.skeleton}
          />
          <VisuallyHidden role="status" aria-busy="true">
            {t('common.loadingMethods')}
          </VisuallyHidden>
        </Stack>
      ) : null}
      {hasCode ? (
        <AuthForm
          labelledBy={titleId}
          gap="middle"
          onSubmit={() =>
            form.submit(valid, () =>
              onSubmit(
                channel,
                channel === 'phone' ? (draft.phone ?? '') : draft.email.trim()
              )
            )
          }
        >
          {phoneCode && emailCode ? (
            <MethodTabs
              {...part('tabs')}
              value={channel}
              onChange={(next) => {
                form.reset();
                onDraftChange({ channel: next });
              }}
              label={t('identify.tabs')}
              items={[
                { value: 'phone', label: t('identify.tabPhone') },
                { value: 'email', label: t('identify.tabEmail') },
              ]}
            />
          ) : null}
          <Field>
            {channel === 'phone' ? (
              <PhoneInput
                label={t('common.phone')}
                value={draft.phone}
                onChange={(phone) => onDraftChange({ phone })}
                autoComplete="tel"
                error={invalid ? invalidText : undefined}
                pickerOpen={preset.countryPickerOpen}
              />
            ) : (
              <FloatingLabelInput
                label={t('common.email')}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={draft.email}
                onChange={(event) =>
                  onDraftChange({ email: event.target.value })
                }
                error={invalid ? invalidText : undefined}
              />
            )}
          </Field>
          {/* The consent to the personal data processing goes right with the identifier. */}
          <Legal {...part('legal')} links={legalLinks} />
          <SubmitButton
            pending={pending}
            pendingLabel={t('common.pending')}
            disabled={waiting > 0}
          >
            {t('common.continue')}
          </SubmitButton>
        </AuthForm>
      ) : null}
      {withPassword && !hasCode ? (
        <SubmitButton
          htmlType="button"
          icon={<LockOutlined aria-hidden />}
          onClick={onPassword}
        >
          {t('identify.withPassword')}
        </SubmitButton>
      ) : null}
      {(hasCode || withPassword) && providers.length ? (
        <Divider {...part('divider')} label={t('common.or')} />
      ) : null}
      {providers.length ? (
        <SocialButtons
          {...part('social')}
          intent="signIn"
          providers={providers}
          label={t('social.group')}
          buttonLabel={(provider) =>
            t('social.signIn', { provider: provider.name })
          }
          disabled={pending}
          onSelect={onSocial}
        />
      ) : null}
      {withPassword && hasCode ? (
        <TextAction icon={<LockOutlined aria-hidden />} onClick={onPassword}>
          {t('identify.withPassword')}
        </TextAction>
      ) : null}
      {!hasCode && !blocked && status === 'ready' ? (
        <Legal {...part('legal')} links={legalLinks} />
      ) : null}
    </Screen>
  );
};

const useStyles = createStyles(({ css }) => ({
  // As tall as the field it stands for.
  skeleton: css`
    && {
      height: ${FLOATING_FIELD_HEIGHT}px;
    }
  `,
}));
