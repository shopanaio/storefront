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
import { formatPhoneNumberIntl } from 'react-phone-number-input';
import { useIsMobile } from '@src/hooks/useIsMobile';

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
  const isMobile = useIsMobile();
  const t = useTranslations('Checkout');
  const [, token] = useToken();
  const [open, setOpen] = useState(false);

  const methods = useForm<ContactForm>({ defaultValues });
  const { control, reset, watch, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    reset(data ?? defaultValues);
  }, [data, reset]);

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

  const onDrawerSubmit = methods.handleSubmit((data) => {
    onSubmit(data);
    setOpen(false);
  });

  return (
    <>
      <Button
        color="default"
        variant={'outlined'}
        onClick={() => setOpen(true)}
        icon={<TbUser size={24} color={token.colorIcon} />}
        className={clsx(styles.button)}
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
          <Typography.Text type="secondary">{title}</Typography.Text>
        )}
      </Button>

      <DrawerBase
        engine={isMobile ? 'overlay' : 'vaul'}
        open={open}
        onClose={() => setOpen(false)}
        header={
          <DrawerBase.Header gap={8} justify="space-between" align="center">
            <DrawerBase.Title>{title}</DrawerBase.Title>
            <DrawerBase.CloseButton />
          </DrawerBase.Header>
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
            <StickyButton onClick={onDrawerSubmit}>{t('save')}</StickyButton>
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
