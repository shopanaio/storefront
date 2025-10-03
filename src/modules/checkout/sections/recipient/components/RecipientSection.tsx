'use client';

import { Flex, Switch, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useForm, FormProvider } from 'react-hook-form';
import { ContactSelect } from '@src/modules/checkout/components/contact/ContactSelect';
import type { ContactValues } from '@src/modules/checkout/components/contact/ContactSelect';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { useEffect } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

/**
 * Recipient section component.
 * Renders a switch "Recipient is another person". When enabled, shows separate recipient fields.
 * When disabled, current user is the recipient (no extra fields shown).
 */
export const RecipientSection = () => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  type RecipientForm = { isRecipientSelf: boolean; recipientFirstName?: string; recipientLastName?: string; recipientMiddleName?: string; recipientPhone?: string };
  const methods = useForm<RecipientForm>({
    defaultValues: {
      isRecipientSelf: true,
      recipientFirstName: '',
      recipientLastName: '',
      recipientMiddleName: '',
      recipientPhone: '',
    },
    mode: 'onChange',
  });
  const { publishValid, publishInvalid } = useSectionController('recipient', { required: true });

  const isSelf = methods.watch('isRecipientSelf') ?? true;

  const [
    recipientFirstName,
    recipientLastName,
    recipientMiddleName,
    recipientPhone,
  ] = [
    methods.watch('recipientFirstName'),
    methods.watch('recipientLastName'),
    methods.watch('recipientMiddleName'),
    methods.watch('recipientPhone'),
  ];

  const recipientValues: ContactValues = {
    userFirstName: recipientFirstName || '',
    userLastName: recipientLastName || '',
    userMiddleName: recipientMiddleName || '',
    userPhone: (recipientPhone as any) || '',
  };

  const handleRecipientSave = (next: ContactValues) => {
    methods.setValue('recipientFirstName', next.userFirstName);
    methods.setValue('recipientLastName', next.userLastName);
    methods.setValue('recipientMiddleName', next.userMiddleName);
    methods.setValue('recipientPhone', next.userPhone);
    if (isSelf) {
      publishValid({ self: true });
    } else {
      publishValid({ self: false, ...next });
    }
  };

  useEffect(() => {
    if (!isSelf) {
      const schema = yup.object({
        recipientFirstName: yup.string().trim().required('required'),
        recipientLastName: yup.string().trim().required('required'),
        recipientMiddleName: yup.string().optional(),
        recipientPhone: yup.string().trim().required('required'),
      });
      const data = {
        recipientFirstName: recipientFirstName || '',
        recipientLastName: recipientLastName || '',
        recipientMiddleName: recipientMiddleName || '',
        recipientPhone: (recipientPhone as any) || '',
      };
      (async () => {
        try {
          await schema.validate(data, { abortEarly: false });
          publishValid({ self: false, ...recipientValues });
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
    } else {
      publishValid({ self: true });
    }
  }, [isSelf, recipientFirstName, recipientLastName, recipientMiddleName, recipientPhone, publishValid, publishInvalid]);

  return (
    <Flex vertical gap={12} className={styles.container}>
      <Flex className={styles.switchLabel}>
        <Switch
          id="is-recipient-self-switch"
          checked={!isSelf}
          onChange={(checked) => methods.setValue('isRecipientSelf', !checked)}
        />
        <label htmlFor="is-recipient-self-switch" style={{ cursor: 'pointer' }}>
          <Typography.Text>{t('i-am-recipient')}</Typography.Text>
        </label>
      </Flex>

      <FormProvider {...methods}>
        {!isSelf ? (
          <ContactSelect
            values={recipientValues}
            onSave={handleRecipientSave}
            title={t('recipient')}
          />
        ) : null}
      </FormProvider>

      {/* Comment section moved to separate SectionRenderer('comment') */}
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  container: css``,
  switchLabel: css`
    display: flex;
    align-items: center;
    gap: ${token.marginXS}px;
  `,
}));

export default RecipientSection;
