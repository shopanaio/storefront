'use client';

import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import useToken from 'antd/es/theme/useToken';
import { DrawerBase } from '@src/components/UI/DrawerBase';
import { StickyButton } from '@src/components/UI/StickyButton';
import { NameFields } from './NameFields';
import { PhoneInputField } from './phone/PhoneNumberField';
import { FormProvider, useForm } from 'react-hook-form';
import { TbUser } from 'react-icons/tb';
import clsx from 'clsx';

/**
 * Controlled contact values.
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
  /** Current contact values to display and prefill */
  values: ContactValues;
  /** Called when user presses Save in the drawer */
  onSave: (values: ContactValues) => void;
  /** Drawer title (required) */
  title: ReactNode;
}

/**
 * ContactSelect renders a CitySelect-like button. On click, a drawer opens
 * with contact form inputs (name fields + phone). The button shows a concise
 * summary (full name and masked phone) when data is present.
 */
export const ContactSelect = ({ values, onSave, title }: ContactSelectProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const [, token] = useToken();

  const [open, setOpen] = useState(false);

  // Local form inside the drawer to stage changes until Save
  const methods = useForm<ContactValues>({
    defaultValues: {
      userFirstName: '',
      userLastName: '',
      userMiddleName: '',
      userPhone: '',
    },
    mode: 'onChange',
  });
  const { control, setError, getValues, reset } = methods;

  // Button summary is derived from controlled props
  const firstName = values.userFirstName;
  const lastName = values.userLastName;
  const middleName = values.userMiddleName;
  const phone = values.userPhone;

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
        onClick={() => {
          // Initialize inner form with current controlled values
          reset({
            userFirstName: values.userFirstName || '',
            userLastName: values.userLastName || '',
            userMiddleName: values.userMiddleName || '',
            userPhone: values.userPhone || '',
          });
          setOpen(true);
        }}
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
          <Typography.Text type="secondary">{t('contact')}</Typography.Text>
        )}
      </Button>

      <DrawerBase
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        footer={
          <StickyButton
            onClick={() => {
              const next = getValues();
              let hasErrors = false;
              const requiredKeys: (keyof ContactValues)[] = [
                'userFirstName',
                'userLastName',
                'userMiddleName',
                'userPhone',
              ];
              requiredKeys.forEach((key) => {
                const v = next[key];
                if (!v || String(v).trim().length === 0) {
                  setError(key, { type: 'required' });
                  hasErrors = true;
                }
              });
              if (hasErrors) return;
              onSave(next);
              setOpen(false);
            }}
          >
            {t('save')}
          </StickyButton>
        }
      >
        <FormProvider {...methods}>
          <Flex vertical gap={12}>
            <NameFields
              firstNameKey="userFirstName"
              lastNameKey="userLastName"
              middleNameKey="userMiddleName"
            />
            <PhoneInputField
              control={control}
              name="userPhone"
              label={t('phone-number')}
              country={'UA'}
              international
              withCountryCallingCode
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
