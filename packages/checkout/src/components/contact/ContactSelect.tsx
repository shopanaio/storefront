'use client';

import { Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import useToken from 'antd/es/theme/useToken';
import { DrawerBase } from '#checkout/ui/DrawerBase';
import { StickyButton } from '#checkout/ui/StickyButton';
import { PhoneInputField } from './phone/PhoneNumberField';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { FloatingLabelInput } from '#checkout/ui/FloatingLabelInput';
import { formatPhoneNumberIntl } from 'react-phone-number-input';
import { PiUserCircleCheckDuotone } from 'react-icons/pi';
import { SelectCard } from '#checkout/ui/SelectCard';
import { PiUserCircle } from 'react-icons/pi';

export type ContactForm = {
  firstName: string;
  lastName: string;
  middleName: string;
  phone: string;
  /** Asked only with `withEmail`: a guest's email; a signed-in buyer's comes from the account. */
  email?: string;
};

export interface ContactSelectProps {
  data: ContactForm | null;
  /** Saves the contact; the drawer closes once it resolves and stays open when it fails. */
  onSubmit: (dto: ContactForm) => Promise<void> | void;
  title: ReactNode;
  /** Adds the email field (a guest buyer, design F2). */
  withEmail?: boolean;
}

const defaultValues: ContactForm = {
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
  email: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ContactSelect renders a CitySelect-like button. On click, a drawer opens
 * with contact form inputs (name fields + phone). The button shows a concise
 * summary (full name and masked phone) when data is present.
 */
export const ContactSelect = ({
  title,
  data,
  onSubmit,
  withEmail = false,
}: ContactSelectProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const [, token] = useToken();
  const [open, setOpen] = useState(false);

  const methods = useForm<ContactForm>({ defaultValues });
  const { control, reset, watch, formState } = methods;
  const { errors } = formState;

  // Compared by value: the parent passes a new object on every checkout read. A saved value
  // fills only the fields the buyer has not changed since the last save, so an answer (a
  // normalized phone) never wipes what the buyer is typing in the open drawer (BR-q7dr).
  const dataKey = JSON.stringify({ ...defaultValues, ...data });
  useEffect(() => {
    reset(JSON.parse(dataKey) as ContactForm, { keepDirtyValues: true });
  }, [dataKey, reset]);

  const { firstName, lastName, middleName, phone } = watch();

  const hasValue = useMemo(() => {
    return (
      firstName?.trim().length ||
      lastName?.trim().length ||
      middleName?.trim().length ||
      phone?.trim().length
    );
  }, [firstName, lastName, middleName, phone]);

  const fullName = useMemo(() => {
    return [firstName, lastName, middleName]
      .filter((it) => Boolean(it.trim()))
      .join(' ');
  }, [firstName, lastName, middleName]);

  /** Formats phone in international format */
  const formattedPhone = useMemo(() => {
    if (!phone) return '';
    return formatPhoneNumberIntl(phone) || phone;
  }, [phone]);

  const [saving, setSaving] = useState(false);
  const onDrawerSubmit = methods.handleSubmit(async (values) => {
    // What is sent becomes the saved state of the form: fields changed after it stay dirty.
    const before = { ...formState.defaultValues } as ContactForm;
    reset(values);
    setSaving(true);
    try {
      await onSubmit(values);
      setOpen(false);
    } catch {
      // The failure is shown by the checkout API; the drawer keeps the input for a retry.
      // What was not saved stays dirty, so a later answer of the server does not replace it.
      reset(before, { keepValues: true });
    } finally {
      setSaving(false);
    }
  });

  const UserIcon = hasValue ? PiUserCircleCheckDuotone : PiUserCircle;

  return (
    <>
      <SelectCard
        label={title}
        labelShown={!hasValue}
        selected={Boolean(hasValue)}
        action={hasValue ? t('change') : t('select')}
        onClick={() => setOpen(true)}
        icon={
          <UserIcon
            size={24}
            color={hasValue ? token.colorPrimary : token.colorIcon}
          />
        }
      >
        {hasValue ? (
          <Flex vertical align="start">
            <Typography.Text className={styles.mainText}>
              {fullName || t('full-name')}
            </Typography.Text>
            {formattedPhone && (
              <Typography.Text type="secondary">
                {formattedPhone}
              </Typography.Text>
            )}
          </Flex>
        ) : (
          <Flex vertical align="start">
            <Typography.Text type="secondary">{title}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {t('enter-contact-details')}
            </Typography.Text>
          </Flex>
        )}
      </SelectCard>

      <DrawerBase
        open={open}
        onClose={() => setOpen(false)}
        header={
          <DrawerBase.Header gap={8} justify="space-between" align="center">
            <DrawerBase.Title id="contact-form-title">{title}</DrawerBase.Title>
            <DrawerBase.CloseButton />
          </DrawerBase.Header>
        }
        aria-labelledby="contact-form-title"
      >
        <FormProvider {...methods}>
          <Flex
            vertical
            gap={12}
            role="form"
            aria-label={t('contact-information-form')}
          >
            <Controller
              name="firstName"
              control={control}
              rules={{
                required: t('required-field'),
              }}
              render={({ field }) => (
                <FloatingLabelInput
                  label={t('first-name')}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  status={errors.firstName ? 'error' : undefined}
                  error={errors.firstName?.message}
                  autoComplete="given-name"
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              rules={{
                required: t('required-field'),
              }}
              render={({ field }) => (
                <FloatingLabelInput
                  label={t('last-name')}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  status={errors.lastName ? 'error' : undefined}
                  error={errors.lastName?.message}
                  autoComplete="family-name"
                />
              )}
            />
            <Controller
              name="middleName"
              control={control}
              rules={{
                required: t('required-field'),
              }}
              render={({ field }) => (
                <FloatingLabelInput
                  label={t('middle-name')}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  status={errors.middleName ? 'error' : undefined}
                  error={errors.middleName?.message}
                  autoComplete="additional-name"
                />
              )}
            />
            <PhoneInputField
              control={control}
              name="phone"
              label={t('phone-number')}
              country={'UA'}
              international
              withCountryCallingCode
              validationMessages={{
                required: t('required-field'),
                invalidFormat: t('phone-invalid-format'),
                invalidLength: t('phone-invalid-length'),
              }}
              error={errors.phone?.message}
              autoComplete="tel"
            />
            {withEmail ? (
              <Controller
                name="email"
                control={control}
                rules={{
                  pattern: { value: EMAIL_PATTERN, message: t('email-invalid-format') },
                }}
                render={({ field }) => (
                  <FloatingLabelInput
                    label={t('email')}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    status={errors.email ? 'error' : undefined}
                    error={errors.email?.message}
                    autoComplete="email"
                    type="email"
                  />
                )}
              />
            ) : null}
            <StickyButton onClick={onDrawerSubmit} loading={saving}>
              {t('save')}
            </StickyButton>
          </Flex>
        </FormProvider>
      </DrawerBase>
    </>
  );
};

const useStyles = createStyles(({ css, token }) => {
  return {
    mainText: css`
      max-width: 300px !important;
      line-height: 1;
      font-size: ${token.fontSize}px;
    `,
    secondaryText: css`
      font-size: ${token.fontSizeSM}px;
      line-height: 1;
    `,
  };
});

export default ContactSelect;
