import { Button, Flex, Typography } from 'antd';
import type { Settlement } from '#checkout/vendors/nova-poshta/types';

interface Prop {
  item: Settlement;
  changeCity: (city: Settlement) => void;
}

export const CityOption = ({ item, changeCity }: Prop) => {
  return (
    <Button
      key={item.ref}
      onClick={() => changeCity(item)}
      variant="text"
      size="large"
      color="default"
      // The hover background has room around the two lines.
      style={{
        justifyContent: 'start',
        height: 'auto',
        padding: '8px 12px',
      }}
    >
      <Flex vertical align="start">
        <Typography.Text>{item.name}</Typography.Text>
        <Typography.Text type="secondary">{item.present}</Typography.Text>
      </Flex>
    </Button>
  );
};
