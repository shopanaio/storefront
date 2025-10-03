'use client';

import { Alert, Flex } from 'antd';
import { SubmitButton } from './SubmitButton';
import { TermsNotice } from '../notices/TermsNotice';
import { createStyles } from 'antd-style';

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
  const { styles } = useStyles();

  return (
    <Flex vertical gap={12}>
      {validationError && (
        <Alert
          message={validationError}
          type="error"
          showIcon
          closable
          onClose={onClearError}
        />
      )}
      <SubmitButton />
      <TermsNotice linkClassName={styles.confirmLinkBtn} />
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  confirmLinkBtn: css`
    padding: 0;
    text-decoration: underline;
  `,
}));
