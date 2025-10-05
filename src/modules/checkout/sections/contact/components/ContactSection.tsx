'use client';

import { ContactSelect } from '@src/modules/checkout/components/contact/ContactSelect';
import type { ContactValues } from '@src/modules/checkout/components/contact/ContactSelect';
import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useForm, FormProvider } from 'react-hook-form';
import { useEffect } from 'react';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

/**
 * Contact section component.
 * Renders phone input field.
 */
export const ContactSection1 = () => {
  return <div />;
};

export const ContactSection = () => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const methods = useForm<ContactValues>({
    defaultValues: {
      userFirstName: '',
      userLastName: '',
      userMiddleName: '',
      userPhone: '',
    },
    mode: 'onChange',
  });
  const { publishValid, publishInvalid } = useSectionController<'contact'>('contact', {
    required: true,
  });

  const schema = yup.object({
    userFirstName: yup.string().optional(),
    userLastName: yup.string().optional(),
    userMiddleName: yup.string().optional(),
    userPhone: yup.string().trim().required('required'),
  });

  const [userFirstName, userLastName, userMiddleName, userPhone] =
    methods.watch([
      'userFirstName',
      'userLastName',
      'userMiddleName',
      'userPhone',
    ] as const);

  const values: ContactValues = {
    userFirstName: userFirstName || '',
    userLastName: userLastName || '',
    userMiddleName: userMiddleName || '',
    userPhone: userPhone || '',
  };

  useEffect(() => {
    if (1) {
      return;
    }
    (async () => {
      try {
        await schema.validate(values, { abortEarly: false });
        publishValid({ ...values });
      } catch (e: any) {
        const errs: Record<string, string> = {};
        if (e?.inner?.length) {
          for (const err of e.inner) {
            if (err.path) errs[err.path] = err.message || 'invalid';
          }
        }
        if (Object.keys(errs).length > 0) publishInvalid(errs);
      }
    })();
    // Do not auto-publish valid here to avoid overriding user intent; handled on save
  }, [
    values.userFirstName,
    values.userLastName,
    values.userMiddleName,
    values.userPhone,
    publishValid,
    publishInvalid,
  ]);

  const handleSave = (next: ContactValues) => {
    methods.setValue('userFirstName', next.userFirstName);
    methods.setValue('userLastName', next.userLastName);
    methods.setValue('userMiddleName', next.userMiddleName);
    methods.setValue('userPhone', next.userPhone);
    try {
      publishValid({ ...next });
    } catch {
      publishInvalid?.({});
    }
  };

  return (
    <FormProvider {...methods}>
      <Flex vertical gap={12} className={styles.container}>
        <ContactSelect
          values={values}
          onSave={handleSave}
          title={t('contact')}
        />
      </Flex>
    </FormProvider>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default ContactSection;
