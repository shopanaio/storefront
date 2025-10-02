import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { City } from '../../types';

interface Prop {
  item: City | null;
  changeCity: (city: City) => void;
}

export const CityModalItem = ({ item, changeCity }: Prop) => {
  const { styles } = useStyles();

  if (!item) return null;
  return (
    <Button
      key={item?.Ref}
      className={styles.item}
      onClick={() => changeCity(item)}
    >
      <Flex vertical align="start">
        <Typography.Text strong>{item?.MainDescription}</Typography.Text>
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
