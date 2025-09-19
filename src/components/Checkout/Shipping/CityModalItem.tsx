import { Button, Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { TbMapPin } from "react-icons/tb";
import { City } from "../Checkout";

interface Prop {
  item: City | null;
  changeCity: (city: City) => void;
}

export const CityModalItem = ({ item, changeCity }: Prop) => {
  const { styles } = useStyles();

  if (!item) return null;
  return (
    <Button
      type="text"
      icon={<TbMapPin size={18} />}
      key={item?.Ref}
      className={styles.item}
      onClick={() => changeCity(item)}
    >
      <Flex vertical align="start">
        <Typography.Text strong>
          {`${item?.SettlementTypeCode} ${item?.MainDescription}`}
        </Typography.Text>
        <Typography.Text type="secondary">
          {`${item?.Area} ${item?.ParentRegionCode}`}
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
  };
});
