'use client';

import { Flex, Typography, Button } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { StepHeader } from '@src/modules/box-builder/components/StepHeader';

import { EmptyBox } from '../Images/EmptyBox';
import { useBoxBuilderCart } from '@src/modules/box-builder/hooks/useCart';
import Progress from '@src/modules/box-builder/components/Progress';
import { ActivityComponentType } from '@stackflow/react';
import Layout, {
  LayoutFooterButton,
} from '@src/modules/box-builder/components/Layout';
import { Activity, useFlow } from '@src/modules/box-builder/Stack';
import { useBoxBuilderProgress } from '@src/modules/box-builder/hooks/useCartProgress';
import type { Entity } from '@shopana/entity';
import BoxCartLine from '@src/modules/box-builder/components/BoxCartLine';
import SpecialBoxCartLine from '@src/modules/box-builder/components/SpecialBoxCartLine';
import { useBoxBuilderProducts } from '@src/modules/box-builder/hooks/useBoxProducts';
import { ProductType } from '@src/modules/box-builder/components/ProductCard';
import { Badge } from '@src/components/UI/Badge';

const { Text, Title } = Typography;

const Cart: ActivityComponentType<{}> = () => {
  const { cart } = useBoxBuilderCart();

  if (!cart?.totalQuantity) {
    return <EmptyCart />;
  }

  return <CartContent cart={cart} />;
};

const CartContent: React.FC<{ cart: Entity.Cart }> = ({ cart }) => {
  const { progress, products: productsInfo } = useBoxBuilderProgress();
  const { push, replace } = useFlow();
  const { boxes, cards, products } = useBoxBuilderProducts();

  const { styles } = useStyles();
  const t = useTranslations('BoxBuilder');

  const hasNoProducts = products.length === 0;

  return (
    <Layout
      showCart={false}
      footer={
        hasNoProducts ? (
          <LayoutFooterButton
            onClick={() => {
              replace(Activity.Step2, {}, [Activity.Step1]);
            }}
            label={t('choose-products-empty')}
            size="large"
            divider={null}
          />
        ) : (
          <LayoutFooterButton
            onClick={() => {
              push(Activity.Checkout, {});
            }}
            label={t('checkout')}
            money={cart?.cost?.subtotalAmount}
            size="large"
          />
        )
      }
    >
      <Flex vertical className={styles.container} gap={20}>
        <StepHeader
          subtitle={t('step-check.subtitle')}
          title={t('step-check.title')}
          description={t('step-check.description')}
        />
        <Progress percent={progress} description={true} />
        <div>
          <Flex>
            <Title className={styles.title} level={5}>
              <span>{t('step-check.selected-design')}</span>
            </Title>
          </Flex>
          {boxes.length ? (
            <Flex vertical gap={8}>
              {boxes.map((cartLine) => (
                <SpecialBoxCartLine
                  key={cartLine.id}
                  cartLine={cartLine}
                  productType={ProductType.Box}
                />
              ))}
            </Flex>
          ) : (
            <Button
              variant="link"
              color="primary"
              onClick={() => push(Activity.Step1, {})}
              style={{ padding: 0, marginTop: 12 }}
            >
              {t('select-design')}
            </Button>
          )}
          {cards.length ? (
            <Flex vertical gap={8} style={{ marginTop: 8 }}>
              {cards.map((cartLine) => (
                <SpecialBoxCartLine
                  key={cartLine.id}
                  cartLine={cartLine}
                  productType={ProductType.Card}
                />
              ))}
            </Flex>
          ) : (
            <Button
              variant="link"
              color="primary"
              onClick={() =>
                push(Activity.Product, {
                  productHandle: 'greeting-card',
                  productType: ProductType.Card,
                  opener: Activity.Cart,
                })
              }
              style={{ padding: 0, marginTop: 12 }}
            >
              {t('select-card')}
            </Button>
          )}
        </div>
        {!hasNoProducts && (
          <div>
            <Title className={styles.title} level={5}>
              <span>
                {t('step-check.products-in-box')}
                <Badge
                  count={productsInfo.quantity || 0}
                  offset={[4, -4]}
                  variant="primary"
                />
              </span>
            </Title>
            <Flex vertical gap={8}>
              {products.map((cartLine) => (
                <BoxCartLine key={cartLine.id} cartLine={cartLine} />
              ))}
            </Flex>
          </div>
        )}
        {hasNoProducts && (
          <Flex
            className={styles.emptyProductsContainer}
            vertical
            align="center"
            justify="center"
            gap={4}
          >
            <Text strong className={styles.emptyTitle}>
              {t('step-check.empty.title')}
            </Text>
            <Text className={styles.emptyDescription}>
              {t('step-check.no-products')}
            </Text>
          </Flex>
        )}
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
          onClick={() => pop()}
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
    emptyProductsContainer: css`
      flex: 1;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100px;
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
