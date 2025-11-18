import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { City } from '@src/modules/checkout/vendors/novaposta/types';

interface Prop {
  item: City | null;
  changeCity: (city: City) => void;
}

export const CityOption = ({ item, changeCity }: Prop) => {
  const { styles } = useStyles();

  if (!item) return null;
  return (
    <Button
      key={item?.ref}
      className={styles.item}
      onClick={() => changeCity(item)}
    >
      <Flex vertical align="start">
        <Typography.Text>{item?.mainDescription}</Typography.Text>
        <Typography.Text type="secondary">{item?.area}</Typography.Text>
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
