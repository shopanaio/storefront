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
 * Renders a switch "Recipient is another person". When enabled, shows separate recipient fields.
 * When disabled, current user is the recipient (no extra fields shown).
 */
export const RecipientSection = () => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const form = useFormContext();

  const isSelf = form.watch('isRecipientSelf') ?? true;

  const [
    recipientFirstName,
    recipientLastName,
    recipientMiddleName,
    recipientPhone,
  ] = form.watch([
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
      <Flex className={styles.switchLabel}>
        <Switch
          id="is-recipient-self-switch"
          checked={!isSelf}
          onChange={(checked) => form.setValue('isRecipientSelf', !checked)}
        />
        <label htmlFor="is-recipient-self-switch" style={{ cursor: 'pointer' }}>
          <Typography.Text>{t('i-am-recipient')}</Typography.Text>
        </label>
      </Flex>

      {!isSelf ? (
        <ContactSelect
          values={recipientValues}
          onSave={handleRecipientSave}
          title={t('recipient')}
        />
      ) : null}

      <RecipientComment />
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
