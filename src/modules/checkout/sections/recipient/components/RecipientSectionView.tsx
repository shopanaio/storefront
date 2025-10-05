'use client';

import { Flex, Switch, Typography } from 'antd';
import { createStyles } from 'antd-style';
import type { ReactNode } from 'react';
import { ContactSelect } from '@src/modules/checkout/components/contact/ContactSelect';
import type { ContactDto } from '@src/modules/checkout/core/contracts/dto';

/**
 * View component for the checkout recipient section.
 *
 * Pure UI component that renders the recipient switch and contact form.
 */
export interface RecipientSectionViewProps {
  /** Whether the recipient is the user themselves */
  isRecipientSelf: boolean;
  /** Initial recipient values to prefill */
  initialValues: Partial<ContactDto>;
  /** Label for the switch */
  switchLabel: ReactNode;
  /** Title for the recipient contact form */
  recipientTitle: ReactNode;
  /** Called when switch is toggled */
  onSwitchChange: (checked: boolean) => void;
  /** Called when recipient data is valid */
  onValid: (dto: ContactDto) => void;
  /** Called when recipient data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
}

export const RecipientSectionView = ({
  isRecipientSelf,
  initialValues,
  switchLabel,
  recipientTitle,
  onSwitchChange,
  onValid,
  onInvalid,
}: RecipientSectionViewProps) => {
  const { styles } = useStyles();

  return (
    <Flex vertical gap={12} className={styles.container}>
      <Flex className={styles.switchLabel}>
        <Switch
          id="is-recipient-self-switch"
          checked={!isRecipientSelf}
          onChange={onSwitchChange}
        />
        <label htmlFor="is-recipient-self-switch" style={{ cursor: 'pointer' }}>
          <Typography.Text>{switchLabel}</Typography.Text>
        </label>
      </Flex>

      {!isRecipientSelf ? (
        <ContactSelect
          initialValues={initialValues}
          onValid={onValid}
          onInvalid={onInvalid}
          title={recipientTitle}
        />
      ) : null}
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

export default RecipientSectionView;
