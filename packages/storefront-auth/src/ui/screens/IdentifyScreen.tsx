'use client';

import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { useLocale, useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { FloatingLabelInput, PhoneInput } from '@shopana/storefront-ui';
import type { AuthError } from '../../core/AuthError';
import type { AuthMethods } from '../../core/types';
import { useAuthUI, type AuthMethodTab } from '../AuthUIProvider';
import {
  AuthAlert,
  Field,
  Footer,
  InlineAction,
  RateLimitAlert,
  Screen,
  ScreenTitle,
  Stack,
  SubmitButton,
  TextAction,
  useRateLimit,
} from '../common/Screen';
import { isEmail, isPhone } from '../common/validation';
import { socialProviderView } from '../parts/providers';
import { contextCopy, type AuthContext, type IdentifyNotice } from './types';

export interface IdentifyScreenProps {
  context: AuthContext;
  /** Configuration of the methods is loading, ready, or could not be read. */
  status: 'loading' | 'ready' | 'unavailable';
  methods: AuthMethods | null;
  channel: AuthMethodTab;
  onChannelChange: (channel: AuthMethodTab) => void;
  phone: string | undefined;
  onPhoneChange: (phone: string | undefined) => void;
  email: string;
  onEmailChange: (email: string) => void;
  pending: boolean;
  error: AuthError | null;
  notice: IdentifyNotice | null;
  /** Sends a code to the phone or the email. */
  onSubmit: (channel: AuthMethodTab, destination: string) => void;
  onPassword: () => void;
  onSignUp: () => void;
  onSocial: (provider: string) => void;
  /** Opens the country list of the phone (stories). */
  countryPickerOpen?: boolean;
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
  channel,
  onChannelChange,
  phone,
  onPhoneChange,
  email,
  onEmailChange,
  pending,
  error,
  notice,
  onSubmit,
  onPassword,
  onSignUp,
  onSocial,
  countryPickerOpen,
}: IdentifyScreenProps) => {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const { styles } = useStyles();
  const { components, legalLinks, part } = useAuthUI();
  const { MethodTabs, Divider, SocialButtons, Legal } = components;
  const copy = contextCopy(context);
  const titleId = useId();
  const [touched, setTouched] = useState(false);
  const waiting = useRateLimit(error);

  const accountsDisabled = error?.code === 'disabled';
  const blocked = status === 'loading' || accountsDisabled;
  const phoneCode = Boolean(methods?.phoneOtp.signIn) && !blocked;
  const emailCode = Boolean(methods?.emailOtp.signIn) && !blocked;
  const hasCode = phoneCode || emailCode;
  const withPassword = Boolean(methods?.password.signIn) && !blocked;
  const providers = blocked ? [] : (methods?.social ?? []).map((item) => socialProviderView(item.provider));
  const activeChannel: AuthMethodTab =
    phoneCode && emailCode ? channel : phoneCode ? 'phone' : 'email';
  const value = activeChannel === 'phone' ? (phone ?? '') : email;
  const valid = activeChannel === 'phone' ? isPhone(phone) : isEmail(email);
  const invalid = (touched && !valid) || error?.code === 'invalidInput';
  const invalidText =
    activeChannel === 'phone' ? t('common.invalidPhone') : t('common.invalidEmail');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!valid) return;
    onSubmit(activeChannel, activeChannel === 'phone' ? value : value.trim());
  };

  const alert = (() => {
    if (status === 'loading') return null;
    if (accountsDisabled)
      return <AuthAlert type="info">{t(copy.accountsDisabled)}</AuthAlert>;
    switch (error?.code) {
      case 'expired':
        return <AuthAlert type="warning">{t('alerts.expired')}</AuthAlert>;
      case 'rateLimited':
        return <RateLimitAlert error={error} />;
      case 'deliveryUnavailable':
        return <AuthAlert type="error">{t('alerts.deliveryUnavailable')}</AuthAlert>;
      case 'methodDisabled':
        return <AuthAlert type="error">{t('alerts.methodDisabled')}</AuthAlert>;
      case 'unavailable':
        return <AuthAlert type="error">{t(copy.unavailable)}</AuthAlert>;
      default:
        return null;
    }
  })();

  return (
    <Screen>
      <ScreenTitle
        id={titleId}
        title={t(copy.identifyTitle)}
        subtitle={t(copy.identifySubtitle(hasCode || status === 'loading'))}
      />
      {notice && !blocked ? (
        <AuthAlert type={NOTICE_ALERTS[notice]}>{t(`alerts.${notice}`)}</AuthAlert>
      ) : null}
      {alert}
      {status === 'loading' ? (
        <Stack>
          <Skeleton.Button active block size="large" className={styles.skeleton} />
          <Skeleton.Button active block size="large" className={styles.skeleton} />
          <span className={styles.hidden} role="status" aria-busy="true">
            {t('common.loadingMethods')}
          </span>
        </Stack>
      ) : null}
      {hasCode ? (
        <form className={styles.form} aria-labelledby={titleId} onSubmit={submit} noValidate>
          {phoneCode && emailCode ? (
            <MethodTabs
              {...part('tabs')}
              value={activeChannel}
              onChange={(next) => {
                setTouched(false);
                onChannelChange(next);
              }}
              label={t('identify.tabs')}
              items={[
                { value: 'phone', label: t('identify.tabPhone') },
                { value: 'email', label: t('identify.tabEmail') },
              ]}
            />
          ) : null}
          <Field>
            {activeChannel === 'phone' ? (
              <PhoneInput
                label={t('common.phone')}
                value={phone}
                onChange={onPhoneChange}
                locale={locale}
                autoComplete="tel"
                status={invalid ? 'error' : undefined}
                error={invalid ? invalidText : undefined}
                pickerOpen={countryPickerOpen}
                pickerTexts={{
                  search: t('common.country.search'),
                  title: t('common.country.title'),
                  empty: t('common.country.empty'),
                  trigger: t('common.country.trigger', { country: '{country}', code: '{code}' }),
                }}
              />
            ) : (
              <FloatingLabelInput
                label={t('common.email')}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                status={invalid ? 'error' : undefined}
                error={invalid ? invalidText : undefined}
                aria-invalid={invalid || undefined}
              />
            )}
          </Field>
          <SubmitButton
            pending={pending}
            pendingLabel={t('common.pending')}
            disabled={waiting > 0}
          >
            {t('common.continue')}
          </SubmitButton>
        </form>
      ) : null}
      {withPassword && !hasCode ? (
        <SubmitButton htmlType="button" onClick={onPassword}>
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
          buttonLabel={(provider) => t('social.signIn', { provider: provider.name })}
          disabled={pending}
          onSelect={onSocial}
        />
      ) : null}
      {withPassword && hasCode ? (
        <TextAction strong onClick={onPassword}>
          {t('identify.withPassword')}
        </TextAction>
      ) : null}
      {!blocked && status === 'ready' ? (
        <Legal {...part('legal')} links={legalLinks} />
      ) : null}
      {copy.offersPasswordSignUp && methods?.password.signUp && !blocked ? (
        <Footer>
          {t.rich('identify.signUpPrompt', {
            link: (chunks) => <InlineAction onClick={onSignUp}>{chunks}</InlineAction>,
          })}
        </Footer>
      ) : null}
    </Screen>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  form: css`
    display: flex;
    flex-direction: column;
    gap: ${token.padding}px;
    width: 100%;
    margin: 0;
    text-align: left;
  `,
  skeleton: css`
    && {
      height: ${token.controlHeightLG + 24}px;
    }
  `,
  hidden: css`
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  `,
}));
