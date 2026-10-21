import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { ADDRESS_SECTION_ANCHOR } from '../anchor';

/**
 * Placeholder of the address while the countries or the form of the country load. The anchor
 * stays on the page in every state: validation scrolls to it.
 */
export const AddressSkeleton = () => {
  const { styles } = useStyles();
  return (
    <div id={ADDRESS_SECTION_ANCHOR}>
      <Skeleton.Input block className={styles.skeleton} />
    </div>
  );
};

// Same box as the city button of the Ukrainian form (CitySelect): 64px high, button radius.
const useStyles = createStyles(({ token, css, prefixCls }) => ({
  skeleton: css`
    .${prefixCls}-skeleton-input {
      height: 64px !important;
      border-radius: ${token.borderRadius}px !important;
    }
  `,
}));
