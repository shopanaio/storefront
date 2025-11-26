'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useCart } from '@src/hooks/cart';
import { CartSubtotal } from '@src/components/Cart/CartSubtotal';
import { mq } from '@src/components/Theme/breakpoints';
import { CartTable } from '@src/components/Cart/CartTable';
import { PageLayout } from '@src/layouts/theme/PageLayout';
import { CartPageTitleAndBtn } from '@src/components/Cart/CartPageTitleAndBtn';

export default function CartPageSection() {
  const t = useTranslations('Cart');
  const { styles } = useStyles();
  const { cart } = useCart();

  const cartLines = cart?.lines ?? [];
  const subtotal = cart?.cost?.subtotalAmount;

  return (
    <PageLayout
      breadcrumbs={{
        index: true,
        items: [{ title: t('cart') }],
      }}
    >
      <div className={styles.container}>
        <CartPageTitleAndBtn
          title={t('cart')}
          productsCount={cartLines.length}
        />
        <Flex className={styles.pageBody} vertical>
          <CartTable cartLines={cartLines} variant="page" divider />
          <Flex className={styles.subtotalWrapper}>
            {subtotal && <CartSubtotal subtotal={subtotal as any} />}
          </Flex>
        </Flex>
      </div>
    </PageLayout>
  );
}

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      gap: ${token.margin}px;
      padding-right: ${token.padding}px;
      padding-left: ${token.padding}px;
      width: 100%;
      ${mq.xl} {
        padding: 0;
        margin-right: auto;
        margin-left: auto;
        max-width: 1280px;
      }
      ${mq.xxl} {
        max-width: 1400px;
      }
    `,
    pageBody: css`
      background: ${token.colorBgContainer};
      min-height: 100vh;
      ${mq.xl} {
        flex-direction: row;
        align-items: flex-start;
        gap: ${token.margin}px;
      }
    `,
    subtotalWrapper: css`
      position: sticky;
      bottom: 0;
      z-index: 10;
      margin-top: auto;
      padding: 0 ${token.padding}px 0;
      ${mq.lg} {
        padding: 0;
      }
      ${mq.xl} {
        margin-top: 0;
        position: sticky;
        top: ${token.margin}px;
        align-self: flex-start;
        min-width: 300px;
        max-width: 400px;
      }
    `,
  };
});
