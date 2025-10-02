'use client';

import { Button, Divider, Flex, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { createStyles } from 'antd-style';
import { mq } from '@src/components/Theme/breakpoints';
import { Summary } from './Summary';
import { FormProvider, useForm } from 'react-hook-form';
import { PaymentMethods } from './PaymentMethods';
import { ShippingMethods } from './ShippingMethods';
import { PhoneInputField } from './PhoneInput';
import { TermsNotice } from './TermsNotice';
import { SubmitButton } from './SubmitButton';
import { Entity } from '@src/entity';

const { Text } = Typography;

interface Prop {
  cart: Entity.Cart | null;
  onConfirm: () => void;
  brand?: React.ReactNode;
}

export interface CheckoutFormValues {
  userPhone: string;
  userName: string;
  /**
   * The base checkout keeps only generic fields. Vendor-specific
   * shipping/payment state lives inside vendor modules via useFormContext.
   */
  activeShippingKey?: string;
  payment?: string;
}

export const Checkout = ({ cart, onConfirm, brand }: Prop) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();

  const defaultDeliveryGroup = (cart as any)?.deliveryGroups?.[0];
  const defaultShippingKey = defaultDeliveryGroup?.selectedDeliveryMethod?.code;
  const defaultPayment = defaultDeliveryGroup?.deliveryMethods?.[0]?.code || '';

  const methods = useForm<CheckoutFormValues>({
    defaultValues: {
      userPhone: '',
      userName: '',
      activeShippingKey: defaultShippingKey,
      payment: defaultPayment,
    },
  });

  const { control, handleSubmit } = methods;

  const onSubmit = (_: CheckoutFormValues) => {};

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.container}>
            <div className={styles.main}>
              <Flex className={styles.left}>
                {brand}
                <Flex vertical gap={12}>
                  <Flex justify="space-between" align="center">
                    <Text className={styles.sectionTitle} strong>
                      {t('contact')}
                    </Text>
                    <Button
                      className={styles.logInButton}
                      size="large"
                      type="link"
                    >
                      {t('log-in')}
                    </Button>
                  </Flex>
                  <PhoneInputField
                    control={control}
                    name="userPhone"
                    label={t('phone-number')}
                    placeholder={t('phone')}
                  />
                </Flex>

                <Flex vertical gap={12}>
                  <Text className={styles.sectionTitle} strong>
                    {t('shipping')}
                  </Text>
                  {(cart as any)?.deliveryGroups?.[0]?.deliveryMethods && (
                    <ShippingMethods
                      methods={(cart as any)?.deliveryGroups?.[0]?.deliveryMethods || []}
                    />
                  )}
                </Flex>
                <Flex vertical gap={12}>
                  <Text className={styles.sectionTitle} strong>
                    {t('payment')}
                  </Text>
                  {(cart as any)?.payment?.paymentMethods && (
                    <PaymentMethods
                      methods={(cart as any)?.payment?.paymentMethods || []}
                    />
                  )}
                </Flex>
                <Divider className={styles.divider} />

                <Flex vertical gap={12} className={styles.actionsLeft}>
                  <SubmitButton />
                  <TermsNotice linkClassName={styles.confirmLinkBtn} />
                </Flex>
              </Flex>
              <Flex className={styles.rightContainer}>
                <Flex vertical gap={12} className={styles.right}>
                  {cart ? <Summary cart={cart} /> : null}
                  <Flex vertical gap={12} className={styles.actionsRight}>
                    <SubmitButton />
                    <TermsNotice linkClassName={styles.confirmLinkBtn} />
                  </Flex>
                </Flex>
              </Flex>
            </div>
          </div>
        </form>
      </FormProvider>
    </>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      width: 100%;
    `,
    main: css`
      display: flex;
      flex-direction: column;
      height: 100%;

      ${mq.lg} {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
    `,
    left: css`
      width: 100%;
      flex-direction: column;
      gap: ${token.marginMD}px;
      border-right: 2px solid ${token.colorBorderSecondary};
      padding: ${token.padding}px;

      ${mq.lg} {
        margin-left: auto;
        max-width: calc(1280px / 2);
        padding: ${token.paddingXL}px;
      }
    `,
    rightContainer: css`
      background-color: ${token.colorBgLayout};
    `,
    right: css`
      width: 100%;
      padding: ${token.padding}px;

      ${mq.lg} {
        max-width: calc(1280px / 2);
        position: sticky;
        padding: ${token.paddingXL}px;
        min-height: 100vh;
        top: 0;
      }
    `,
    actionsLeft: css`
      display: none;
      ${mq.lg} {
        display: flex;
      }
    `,
    actionsRight: css`
      ${mq.lg} {
        display: none;
      }
    `,
    sectionTitle: css`
      font-size: ${token.fontSizeXL}px;
    `,
    divider: css`
      margin: 0;
    `,
    confirmLinkBtn: css`
      padding: 0;
      text-decoration: underline;
    `,
    logInButton: css`
      padding: 0;
    `,
  };
});
