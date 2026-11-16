import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import type { Settlement } from '#checkout/vendors/nova-poshta/types';

interface Prop {
  item: Settlement;
  changeCity: (city: Settlement) => void;
}

export const CityOption = ({ item, changeCity }: Prop) => {
  const { styles } = useStyles();
  return (
    <Button
      key={item.ref}
      onClick={() => changeCity(item)}
      variant="text"
      size="large"
      color="default"
      // The hover background has room around the two lines; a long name is cut to the list, as
      // the branch items are.
      style={{
        justifyContent: 'start',
        width: '100%',
        minWidth: 0,
        height: 'auto',
        padding: '8px 12px',
      }}
    >
      <Flex vertical align="start" className={styles.content}>
        <Typography.Text ellipsis>{item.name}</Typography.Text>
        <Typography.Text type="secondary" ellipsis>
          {item.present}
        </Typography.Text>
      </Flex>
    </Button>
  );
};

const useStyles = createStyles(({ css }) => ({
  content: css`
    flex: 1;
    min-width: 0;

    & > .ant-typography {
      max-width: 100%;
    }
  `,
}));
