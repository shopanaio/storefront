import { Badge } from "@src/ui-kit/Badge";
import { calcSale } from "@src/utils/calcSale";
import { createStyles } from "antd-style";

type SaleBadgeProps = {
  compareAtPrice?: number;
  price: number;
};

export const SaleBadge: React.FC<SaleBadgeProps> = ({
  compareAtPrice,
  price,
}) => {
  const { styles } = useStyles();

  const sale = calcSale(compareAtPrice, price);

  if (!compareAtPrice || !sale) {
    return null;
  }

  return <Badge count={`-${sale}%`} className={styles.saleBadge} />;
};

export const useStyles = createStyles(({ css, token }) => ({
  saleBadge: css`
    .ant-badge-count {
      padding: 0 ${token.paddingXXS}px;
      color: ${token.colorErrorText};
      background-color: ${token.colorErrorBg};
    }
  `,
}));
