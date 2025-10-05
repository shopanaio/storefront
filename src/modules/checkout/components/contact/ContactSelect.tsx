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
import type { ContactDto } from '@src/modules/checkout/core/contracts/dto';

/**
 * Internal form values.
 */
export type ContactValues = {
  /** Purchaser first name */
  userFirstName: string;
  /** Purchaser last name */
  userLastName: string;
  /** Purchaser middle name */
  userMiddleName: string;
  /** Purchaser phone in E.164 or raw */
  userPhone: string;
};

/**
 * Props for ContactSelect.
 */
export interface ContactSelectProps {
  /** Initial contact values to prefill */
  initialValues: Partial<ContactDto>;
  /** Called when user saves valid contact data */
  onValid: (dto: ContactDto) => void;
  /** Called when contact data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
  /** Drawer title (required) */
  title: ReactNode;
}

/**
 * ContactSelect renders a CitySelect-like button. On click, a drawer opens
 * with contact form inputs (name fields + phone). The button shows a concise
 * summary (full name and masked phone) when data is present.
 */
export const ContactSelect = ({ initialValues, onValid, onInvalid, title }: ContactSelectProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const [, token] = useToken();

  const [open, setOpen] = useState(false);

  // Form manages all contact data
  const methods = useForm<ContactValues>({
    defaultValues: {
      userFirstName: initialValues.userFirstName ?? '',
      userLastName: initialValues.userLastName ?? '',
      userMiddleName: initialValues.userMiddleName ?? '',
      userPhone: initialValues.userPhone ?? '',
    },
    mode: 'onChange',
  });
  const { control, getValues, reset, watch, formState: { errors } } = methods;

  // Sync form when initialValues change
  useEffect(() => {
    reset({
      userFirstName: initialValues.userFirstName ?? '',
      userLastName: initialValues.userLastName ?? '',
      userMiddleName: initialValues.userMiddleName ?? '',
      userPhone: initialValues.userPhone ?? '',
    });
  }, [initialValues, reset]);

  // Watch current form values for display
  const currentValues = watch();

  // Button summary is derived from current form values
  const firstName = currentValues.userFirstName;
  const lastName = currentValues.userLastName;
  const middleName = currentValues.userMiddleName;
  const phone = currentValues.userPhone;

  const hasValue = useMemo(() => {
    return Boolean(
      (firstName && firstName.length > 0) ||
        (lastName && lastName.length > 0) ||
        (middleName && middleName.length > 0) ||
        (phone && phone.length > 0)
    );
  }, [firstName, lastName, middleName, phone]);

  const fullName = useMemo(() => {
    return [firstName, lastName, middleName].filter(Boolean).join(' ');
  }, [firstName, lastName, middleName]);

  /** Masks phone showing last 4 digits */
  const maskedPhone = useMemo(() => {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length <= 4) return phone;
    return `***${digits.slice(-4)}`;
  }, [phone]);

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
          <StickyButton
            onClick={() => {
              // Trigger validation for all fields
              methods.trigger().then((isValid) => {
                if (isValid) {
                  const values = getValues();
                  // Convert to DTO
                  const dto: ContactDto = {
                    userFirstName: values.userFirstName,
                    userLastName: values.userLastName,
                    userMiddleName: values.userMiddleName,
                    userPhone: values.userPhone,
                  };
                  onValid(dto);
                  setOpen(false);
                } else {
                  // Extract errors from form state
                  const fieldErrors: Record<string, string> = {};
                  Object.entries(errors).forEach(([field, error]) => {
                    if (error?.message) {
                      fieldErrors[field] = error.message;
                    }
                  });
                  onInvalid(fieldErrors);
                }
              });
            }}
          >
            {t('save')}
          </StickyButton>
        }
      >
        <FormProvider {...methods}>
          <Flex vertical gap={12}>
            <Controller
              name="userFirstName"
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
                  status={errors.userFirstName ? 'error' : undefined}
                  error={errors.userFirstName?.message}
                />
              )}
            />
            <Controller
              name="userLastName"
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
                  status={errors.userLastName ? 'error' : undefined}
                  error={errors.userLastName?.message}
                />
              )}
            />
            <Controller
              name="userMiddleName"
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
                  status={errors.userMiddleName ? 'error' : undefined}
                  error={errors.userMiddleName?.message}
                />
              )}
            />
            <PhoneInputField
              control={control}
              name="userPhone"
              label={t('phone-number')}
              country={'UA'}
              international
              withCountryCallingCode
              validationMessages={{
                required: t('required-field'),
                invalidFormat: t('phone-invalid-format'),
                invalidLength: t('phone-invalid-length'),
              }}
              error={errors.userPhone?.message}
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
