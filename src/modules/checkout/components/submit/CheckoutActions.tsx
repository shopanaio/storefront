'use client';

import { Alert, Button, Flex } from 'antd';
import { SubmitButton } from './SubmitButton';
import { TermsNotice } from '../notices/TermsNotice';
import { TbX } from 'react-icons/tb';

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
      <SubmitButton />
      <TermsNotice />
    </Flex>
  );
};
