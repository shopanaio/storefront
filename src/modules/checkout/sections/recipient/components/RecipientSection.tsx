'use client';

import { Flex, Switch, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { RecipientComment } from '@src/modules/checkout/components/RecipientComment';
import { ContactSelect } from '@src/modules/checkout/components/contact/ContactSelect';
import type { ContactValues } from '@src/modules/checkout/components/contact/ContactSelect';

/**
 * Recipient section component.
 * Renders a switch "I am the recipient". When enabled, no extra fields shown.
 * When disabled, renders separate recipient name fields.
 */
export const RecipientSection = () => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const form = useFormContext();

  const isSelf = form.watch('isRecipientSelf') ?? true;

  const [recipientFirstName, recipientLastName, recipientMiddleName, recipientPhone] =
    form.watch([
      'recipientFirstName',
      'recipientLastName',
      'recipientMiddleName',
      'recipientPhone',
    ] as const);

  const recipientValues: ContactValues = {
    userFirstName: recipientFirstName || '',
    userLastName: recipientLastName || '',
    userMiddleName: recipientMiddleName || '',
    userPhone: (recipientPhone as any) || '',
  };

  const handleRecipientSave = (next: ContactValues) => {
    form.setValue('recipientFirstName', next.userFirstName);
    form.setValue('recipientLastName', next.userLastName);
    form.setValue('recipientMiddleName', next.userMiddleName);
    form.setValue('recipientPhone', next.userPhone);
  };

  return (
    <Flex vertical gap={12} className={styles.container}>
      <Flex align="center" gap={8}>
        <Switch
          checked={isSelf}
          onChange={(checked) => form.setValue('isRecipientSelf', checked)}
        />
        <Typography.Text>{t('i-am-recipient')}</Typography.Text>
      </Flex>

      {!isSelf ? (
        <ContactSelect values={recipientValues} onSave={handleRecipientSave} />
      ) : null}

      <RecipientComment />
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default RecipientSection;
