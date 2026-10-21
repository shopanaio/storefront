import { Flex, Skeleton } from 'antd';
import { createStyles } from 'antd-style';

/** Placeholder of a list of methods; each block is the size of a method panel. */
export const MethodPanelsSkeleton = ({ count }: { count: number }) => {
  const { styles } = useStyles();
  return (
    <Flex vertical gap={12} aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton.Button key={index} block className={styles.panel} />
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
