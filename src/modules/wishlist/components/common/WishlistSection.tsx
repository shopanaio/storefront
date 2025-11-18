'use client';

import { Flex } from 'antd';

interface Props {
  title?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export const WishlistSection = ({ title, headerAction, children }: Props) => {
  return (
    <Flex vertical gap={12}>
      {(title || headerAction) && (
        <Flex justify="space-between" align="center">
          {title ? <h3>{title}</h3> : null}
          {headerAction}
        </Flex>
      )}
      {children}
    </Flex>
  );
};
