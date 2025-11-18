import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import type { SearchSettlementAddress } from '@shopana/novaposhta-api-client';

interface Prop {
  item: SearchSettlementAddress | null;
  changeCity: (city: SearchSettlementAddress) => void;
}

export const CityOption = ({ item, changeCity }: Prop) => {
  const { styles } = useStyles();

  if (!item) return null;
  return (
    <Button
      key={item?.Ref}
      className={styles.item}
      onClick={() => changeCity(item)}
    >
      <Flex vertical align="start">
        <Typography.Text>{item?.MainDescription}</Typography.Text>
        <Typography.Text type="secondary">{item?.Area}</Typography.Text>
      </Flex>
    </Button>
  );
};

const useStyles = createStyles(({ css }) => {
  return {
    item: css`
      justify-content: flex-start;
      height: 50px;
    `,
  };
});
