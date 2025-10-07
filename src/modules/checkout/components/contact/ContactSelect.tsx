'use client';

import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import useToken from 'antd/es/theme/useToken';
import { DrawerBase } from '@src/components/UI/DrawerBase';
import { StickyButton } from '@src/components/UI/StickyButton';
import { PhoneInputField } from './phone/PhoneNumberField';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { TbUser } from 'react-icons/tb';
import clsx from 'clsx';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';

export type ContactForm = {
  firstName: string;
  lastName: string;
  middleName: string;
  phone: string;
};

export interface ContactSelectProps {
  data: ContactForm | null;
  onSubmit: (dto: ContactForm) => void;
  title: ReactNode;
}

const defaultValues: ContactForm = {
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
};

/**
 * ContactSelect renders a CitySelect-like button. On click, a drawer opens
 * with contact form inputs (name fields + phone). The button shows a concise
 * summary (full name and masked phone) when data is present.
 */
export const ContactSelect = ({
  title,
  data,
  onSubmit,
}: ContactSelectProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const [, token] = useToken();

  const [open, setOpen] = useState(false);

  const methods = useForm<ContactForm>({
    mode: 'onChange',
    defaultValues,
  });

  const { control, reset, watch, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    reset(data ?? defaultValues);
  }, [data, reset]);

  const { firstName, lastName, middleName, phone } = watch();

  const hasValue = useMemo(() => {
    return (
      Math.max(
        firstName.trim().length,
        lastName.trim().length,
        middleName.trim().length,
        phone.trim().length
      ) > 0
    );
  }, [firstName, lastName, middleName, phone]);

  const fullName = useMemo(() => {
    return [firstName, lastName, middleName]
      .filter((it) => Boolean(it.trim()))
      .join(' ');
  }, [firstName, lastName, middleName]);

  /** Masks phone showing last 4 digits */
  const maskedPhone = useMemo(() => {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length <= 4) return phone;
    return `***${digits.slice(-4)}`;
  }, [phone]);

  const onDrawerSubmit = methods.handleSubmit((data) => {
    onSubmit(data);
    setOpen(false);
  });

  return (
    <>
      <Button
        color={hasValue ? 'primary' : 'default'}
        variant={'outlined'}
        onClick={() => setOpen(true)}
        icon={
          <TbUser
            size={24}
            color={hasValue ? token.colorPrimary : token.colorIcon}
          />
        }
        className={clsx(styles.button, {
          [styles.activeButton]: hasValue,
        })}
      >
        {hasValue ? (
          <Flex className={clsx(styles.flex)}>
            <Typography.Text className={styles.mainText}>
              {fullName || t('full-name')}
            </Typography.Text>
            {maskedPhone && (
              <Typography.Text type="secondary">{maskedPhone}</Typography.Text>
            )}
          </Flex>
        ) : (
          <Typography.Text type="secondary">{title}</Typography.Text>
        )}
      </Button>

      <DrawerBase
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        footer={
          <StickyButton onClick={onDrawerSubmit}>{t('save')}</StickyButton>
        }
      >
        <FormProvider {...methods}>
          <Flex vertical gap={12}>
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
            />
          </Flex>
        </FormProvider>
      </DrawerBase>
    </>
  );
};

const useStyles = createStyles(({ css, token }) => {
  return {
    button: css`
      display: flex;
      justify-content: start;
      padding: ${token.paddingXXS}px ${token.paddingLG}px ${token.paddingXXS}px
        ${token.paddingSM}px;
      min-height: 64px;
      height: 100%;
    `,
    activeButton: css`
      outline: 1px solid ${token.colorPrimary};
    `,
    flex: css`
      flex-direction: column;
      align-items: start;
      gap: ${token.marginXXS}px;
    `,
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
