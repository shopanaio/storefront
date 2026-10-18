'use client';

import { Alert, Flex } from 'antd';
import { SubmitButton } from './SubmitButton';
import { TermsNotice } from '../notices/TermsNotice';
import { PlacementNotice } from '#checkout/components/result/PlacementNotice';
import { IssueNotices } from '#checkout/components/notices/IssueNotices';
import { useUndeliverableLines } from '#checkout/hooks/useUndeliverableLines';
import { useTranslations } from 'next-intl';

interface CheckoutActionsProps {
  /** Validation error message to display */
  validationError: string | null;
  /** Callback to clear validation error */
  onClearError: () => void;
}

/**
 * Checkout actions section containing submit button, terms notice, and validation error display.
 * Handles form submission and error display in a consistent layout.
 */
export const CheckoutActions = ({
  validationError,
  onClearError,
}: CheckoutActionsProps) => {
  const t = useTranslations('Checkout');
  const blocked = useUndeliverableLines().length > 0;
  return (
    <Flex
      vertical
      gap={12}
      style={{
        width: '100%',
      }}
    >
      {validationError && (
        <Alert
          message={validationError}
          type="error"
          showIcon
          closable
          style={{
            minHeight: 50,
          }}
          onClose={onClearError}
        />
      )}
      <PlacementNotice />
      <IssueNotices />
      {blocked && (
        <Alert type="warning" showIcon message={t('undeliverable-blocks-order')} />
      )}
      <SubmitButton />
      <TermsNotice />
    </Flex>
  );
};
