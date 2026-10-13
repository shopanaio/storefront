import { Button, Flex, Typography } from 'antd';
import type { SearchSettlementAddress } from '@shopana/novaposhta-api-client';

interface Prop {
  item: SearchSettlementAddress;
  changeCity: (city: SearchSettlementAddress) => void;
}

export const CityOption = ({ item, changeCity }: Prop) => {
  return (
    <Button
      key={item?.Ref}
      onClick={() => changeCity(item)}
      variant="text"
      size="large"
      color="default"
      style={{
        justifyContent: 'start',
        padding: 0,
      }}
    >
      <Flex vertical align="start">
        <Typography.Text>{item.MainDescription}</Typography.Text>
        <Typography.Text type="secondary">{item.Area}</Typography.Text>
      </Flex>
    </Button>
  );
};
