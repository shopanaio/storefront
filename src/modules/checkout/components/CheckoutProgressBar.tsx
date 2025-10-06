'use client';

import { Progress } from 'antd';
import { createStyles } from 'antd-style';
import { useHasActiveOperations } from '@src/modules/checkout/state/selectors';

/**
 * Progress bar that appears at the top of checkout when there are active operations.
 * Shows an indeterminate progress indicator to inform users that mutations are in-flight.
 */
export const CheckoutProgressBar = () => {
  const { styles } = useStyles();
  const hasActiveOperations = useHasActiveOperations();

  if (!hasActiveOperations) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Progress
        percent={99.9}
        status="active"
        showInfo={false}
        strokeColor={{
          from: '#1890ff',
          to: '#52c41a',
        }}
        size="small"
      />
    </div>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: transparent;
  `,
}));

export default CheckoutProgressBar;
