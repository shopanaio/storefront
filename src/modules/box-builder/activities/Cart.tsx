'use client';

import { Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { StepHeader } from '@src/modules/box-builder/components/StepHeader';

import { EmptyBox } from '../Images/EmptyBox';
import { useBoxBuilderCart } from '@src/modules/box-builder/hooks/useCart';
import Progress from '@src/modules/box-builder/components/Progress';
import { ActivityComponentType } from '@stackflow/react';
import Layout, { LayoutFooterButton } from '../stackflow/Layout';
import { Activity, useFlow } from '@src/modules/box-builder/stackflow/Stack';
import { useBoxBuilderProgress } from '@src/modules/box-builder/hooks/useCartProgress';
import type * as Entity from "@src/entity/namespace";
import BoxCartLine from '@src/modules/box-builder/components/BoxCartLine';

const { Text, Title } = Typography;

const Cart: ActivityComponentType<{}> = () => {
  const { cart } = useBoxBuilderCart();

  if (!cart?.totalQuantity) {
    return <EmptyCart />;
  }

  return <CartContent cart={cart} />;
};

const CartContent: React.FC<{ cart: Entity.Cart }> = ({ cart }) => {
  const { progress } = useBoxBuilderProgress();
  const { push } = useFlow();

  const { styles } = useStyles();
  const t = useTranslations('BoxBuilder');

  return (
    <Layout
      showCart={false}
      footer={
        <LayoutFooterButton
          onClick={() => {
            push(Activity.Checkout, {});
          }}
          label={t('checkout')}
          money={cart?.cost?.totalAmount as ApiMoney}
          size="large"
        />
      }
    >
      <Flex vertical className={styles.container} gap={20}>
        <StepHeader
          subtitle={t('step-check.subtitle')}
          title={t('step-check.title')}
          description={t('step-check.description')}
        />
        <Progress percent={progress} description={false} />
        <div>
          <Flex>
            <Title className={styles.title} level={5}>
              <span>{t('step-check.custom-box')}</span>
              <Text>
                {t('footer.products-count', {
                  count: cart?.totalQuantity || 0,
                })}
              </Text>
            </Title>
          </Flex>
          <Flex vertical gap={8}>
            {cart.lines.map((cartLine) => (
              <BoxCartLine key={cartLine.id} cartLine={cartLine} />
            ))}
          </Flex>
        </div>
      </Flex>
    </Layout>
  );
};

const EmptyCart: React.FC = () => {
  const { styles } = useStyles();
  const t = useTranslations('BoxBuilder');
  const { pop } = useFlow();

  return (
    <Layout
      showCart={false}
      footer={
        <LayoutFooterButton
          onClick={() => pop(3)}
          label={t('choose-box')}
          size="large"
          divider={null}
          rightArrow={false}
        />
      }
    >
      <Flex vertical className={styles.container} gap={20}>
        <StepHeader
          subtitle={t('step-check.subtitle')}
          title={t('step-check.title')}
          description={t('step-check.description')}
        />
        <Flex
          className={styles.emptyContainer}
          vertical
          align="center"
          justify="center"
          gap={36}
        >
          <EmptyBox />
          <Flex vertical gap={4} align="center">
            <Text strong className={styles.emptyTitle}>
              {t('step-check.empty.title')}
            </Text>
            <Text className={styles.emptyDescription}>
              {t('step-check.empty.description')}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Layout>
  );
};

export default Cart;

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      padding: 0 ${token.padding}px;
      min-height: max-content;
      height: 100%;
    `,

    productImageWrapper: css`
      width: 64px;
      height: 64px;
      padding: ${token.paddingXXS}px;
      border-radius: ${token.borderRadius}px;
      border: 1px solid ${token.colorBorder};
      flex-shrink: 0;
    `,
    productImage: css`
      border-radius: ${token.borderRadius}px;
      width: 100%;
      height: 100%;
      object-fit: cover;
    `,
    emptyTitle: css`
      font-size: ${token.fontSizeXL}px;
    `,
    emptyDescription: css`
      font-size: ${token.fontSizeLG}px;
    `,
    emptyContainer: css`
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    `,
    title: css`
      font-size: ${token.fontSizeLG}px;
      margin-top: 0px !important;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      & > span:not(:first-child) {
        font-size: ${token.fontSizeLG}px;
        color: ${token.colorPrimary};
        font-weight: 400;
      }
    `,
    price: css`
      font-size: 18px;
    `,
    selectBoxBtn: css`
      width: 100%;
    `,
  };
});
