'use client';

import { Button, Flex, Typography } from 'antd';
import { createStyles, cx } from 'antd-style';
import { TbChevronRight } from 'react-icons/tb';
import type { model } from '@shopana/storefront-sdk';
import { getGroupItemPrice } from '@src/utils/getGroupItemPrice';
import { Price } from '@src/ui-kit/Price/Price';
import Image from '@src/ui-kit/Image';

const { Text } = Typography;

interface Props {
  option: model.ProductGroupItem;
  isSelected: boolean;
  onClick: () => void;
}

export const ComponentSelect = ({ option, isSelected, onClick }: Props) => {
  const { styles } = useStyles();
  const price = getGroupItemPrice(option);

  return (
    <Button
      className={cx(styles.container, isSelected && styles.selected)}
      onClick={onClick}
    >
      <Flex align="center" gap={8}>
        <Image
          className={styles.optionImg}
          src={option.node.cover?.url}
          alt={option.node.title}
          width={100}
        />
        <Flex vertical align="start">
          <Text strong>{option.node.title}</Text>
          <Text type="secondary">{price && <Price money={price} raw />}</Text>
        </Flex>
      </Flex>
      <TbChevronRight />
    </Button>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorBorder};
    width: 100%;
    height: 100%;
    padding: ${token.paddingXS}px;
    transition: all 0.2s ease;

    &:hover {
      border-color: ${token.colorPrimary};
    }
  `,
  selected: css`
    border-color: ${token.colorPrimary};
    background-color: ${token.colorPrimaryBg};
  `,
  optionImg: css`
    max-width: 74px;
    border-radius: ${token.borderRadius}px;
    aspect-ratio: 1/1;
    object-fit: cover;
  `,
}));
