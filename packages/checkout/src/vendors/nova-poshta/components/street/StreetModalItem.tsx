import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { PiMapPin } from 'react-icons/pi';
import type { Street } from '../../types';

interface Prop {
  item: Street;
  changeStreet: (street: Street) => void;
}

export const StreetModalItem = ({ item, changeStreet }: Prop) => {
  const { styles } = useStyles();

  return (
    <Button
      variant="text"
      color="default"
      icon={<PiMapPin size={18} />}
      className={styles.item}
      size="large"
      onClick={() => changeStreet(item)}
    >
      <Flex vertical align="start">
        <Typography.Text className={styles.streetName}>
          {item.present}
        </Typography.Text>
      </Flex>
    </Button>
  );
};

const useStyles = createStyles(({ css }) => {
  return {
    item: css`
      display: flex;
      justify-content: flex-start;
      padding-left: 0;
    `,

    streetName: css`
      max-width: 300px !important;
    `,
  };
});
