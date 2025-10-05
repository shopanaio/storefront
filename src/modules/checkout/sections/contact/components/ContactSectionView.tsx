'use client';

import { ContactSelect } from '@src/modules/checkout/components/contact/ContactSelect';
import type { ContactDto } from '@src/modules/checkout/core/contracts/dto';
import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import type { ReactNode } from 'react';

/**
 * View component for the checkout contact section.
 *
 * Pure UI component that delegates all form logic to ContactSelect.
 */
export interface ContactSectionViewProps {
  /** Initial contact values to prefill */
  initialValues: Partial<ContactDto>;
  /** Section title */
  title: ReactNode;
  /** Called when user saves contact data */
  onSave: (dto: ContactDto) => void;
}

export const ContactSectionView = ({ initialValues, title, onSave }: ContactSectionViewProps) => {
  const { styles } = useStyles();

  return (
    <Flex vertical gap={12} className={styles.container}>
      <ContactSelect initialValues={initialValues} onSave={onSave} title={title} />
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default ContactSectionView;
