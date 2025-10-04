import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { TbMapPin } from 'react-icons/tb';
import type { Street } from '@checkout/vendors/novaposta/types';

interface Prop {
  item: Street | null;
  changeStreet: (street: Street) => void;
}

export const StreetModalItem = ({ item, changeStreet }: Prop) => {
  const { styles } = useStyles();

  if (!item) return null;
  return (
    <Button
      type="text"
      icon={<TbMapPin size={18} />}
      key={item?.SettlementStreetRef}
      className={styles.item}
      onClick={() => changeStreet(item)}
    >
      <Flex vertical align="start">
        <Typography.Text className={styles.streetName} strong>
          {item?.Present}
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
      height: 60px;
    `,

    streetName: css`
      max-width: 300px !important;
    `,
  };
});
