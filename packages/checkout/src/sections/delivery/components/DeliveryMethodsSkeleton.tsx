import { Flex, Skeleton } from 'antd';
import { createStyles } from 'antd-style';

const PLACEHOLDERS = 3;

/** Placeholder for the method list while the address is applied; each block is the size of a method panel. */
export const DeliveryMethodsSkeleton = () => {
  const { styles } = useStyles();
  return (
    <Flex vertical gap={12} aria-busy="true">
      {Array.from({ length: PLACEHOLDERS }, (_, index) => (
        <Skeleton.Button key={index} active block className={styles.panel} />
      ))}
    </Flex>
  );
};

// Same box as CheckoutMethodPanel: 1px border, header padding and a 40px title row.
const useStyles = createStyles(({ token, css, prefixCls }) => ({
  panel: css`
    .${prefixCls}-skeleton-button {
      height: ${token.paddingSM * 2 + 40 + 2}px !important;
      border-radius: ${token.borderRadiusLG}px !important;
    }
  `,
}));
