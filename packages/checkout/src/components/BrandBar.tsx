'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import type { ReactNode } from 'react';
import { mq } from '@shopana/storefront-ui';

/**
 * The bar of the store's brand over the form. On a phone it is a white bar from edge to edge
 * over the grey page, the logo on the left and `action` on the right. On desktop the form side
 * is white already, so the brand stands as it is. Needs no checkout providers: the page's
 * skeleton shows it before the checkout has loaded.
 */
export const BrandBar = ({
  children,
  action,
}: {
  children?: ReactNode;
  action?: ReactNode;
}) => {
  const { styles } = useStyles();
  if (!children && !action) return null;
  return (
    <Flex
      align="center"
      justify="space-between"
      gap={8}
      className={styles.header}
    >
      <div className={styles.brand}>{children}</div>
      {action}
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  // The negative margins take back the padding of the form column, so the bar meets the edges.
  // The shadow lifts the bar over the grey page; it stays over the content under it.
  header: css`
    position: relative;
    z-index: 1;
    height: 64px;
    margin: -${token.padding}px -${token.padding}px 0;
    padding: 0 ${token.padding}px;
    background-color: ${token.colorBgContainer};
    box-shadow: ${token.boxShadowTertiary};

    ${mq.lg} {
      position: static;
      height: auto;
      margin: 0;
      padding: 0;
      background-color: transparent;
      box-shadow: none;
    }
  `,
  // As wide as the logo on a phone, so it stands on the left; the whole row on desktop, where
  // the theme centers it.
  brand: css`
    min-width: 0;

    ${mq.lg} {
      flex: 1;
    }
  `,
}));
