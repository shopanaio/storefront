'use client';

import { Flex } from 'antd';
import type { ReactNode } from 'react';
import { DrawerBase, useBreakpointDown } from '@shopana/storefront-ui';

/**
 * Header of a picker drawer that searches (cities, branches, streets): the title, then the
 * search field under it, both in view over the list. As in the other drawers of the checkout,
 * the close button is on the side panel only; a bottom sheet closes by dragging it down.
 */
export const SearchDrawerHeader = ({
  title,
  children,
}: {
  title: ReactNode;
  /** The search field. */
  children: ReactNode;
}) => {
  // The breakpoint of `DrawerBase`, below which it is a bottom sheet.
  const isSheet = useBreakpointDown('lg');
  return (
    <DrawerBase.Header vertical gap={8}>
      <Flex
        gap={8}
        justify="space-between"
        align="center"
        style={{ width: '100%' }}
      >
        <DrawerBase.Title>{title}</DrawerBase.Title>
        {isSheet ? null : <DrawerBase.CloseButton />}
      </Flex>
      {children}
    </DrawerBase.Header>
  );
};
