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
import { CheckoutAuth } from './CheckoutAuth';

const { Text } = Typography;

interface Prop {
  cart: Entity.Cart | null;
  onConfirm: () => void;
  brand?: React.ReactNode;
  /**
   * Optional feature flags controlling Checkout UI behavior.
   * - auth: when true, renders the Login button near the contact section.
   */
  features?: {
    /** Gate for rendering login button */
    auth?: boolean;
  };
}

export interface CheckoutFormValues {
  userPhone: string;
  userName: string;
  /**
   * The base checkout keeps only generic fields. Vendor-specific
   * shipping/payment state lives inside vendor modules via useFormContext.
   */
  selectedShippingMethod?: { code: string } | null;
  selectedPaymentMethod?: { code: string } | null;
}

/**
 * Checkout form component that renders contact, shipping, and payment sections.
 * Feature flags can adjust visible UI (e.g., `features.auth` shows login button).
 */
export const Checkout = ({ cart, onConfirm, brand, features }: Prop) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();

  const defaultDeliveryGroup = (cart as any)?.deliveryGroups?.[0];
  const defaultSelectedShippingMethod =
    defaultDeliveryGroup?.selectedDeliveryMethod
      ? { code: defaultDeliveryGroup?.selectedDeliveryMethod?.code }
      : null;
  const defaultSelectedPaymentMethod = (cart as any)?.payment?.selectedPaymentMethod
    ? { code: (cart as any)?.payment?.selectedPaymentMethod?.code }
    : null;

  const methods = useForm<CheckoutFormValues>({
    defaultValues: {
      userPhone: '',
      userName: '',
      selectedShippingMethod: defaultSelectedShippingMethod,
      selectedPaymentMethod: defaultSelectedPaymentMethod,
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
                    {features?.auth ? (
                      <CheckoutAuth className={styles.logInButton} />
                    ) : null}
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
      /* checkout layout variables */
      --checkout-content-max: 1280px;
      /* make left column slightly wider than right */
      --checkout-left-ratio: 0.56;
      --checkout-right-ratio: calc(1 - var(--checkout-left-ratio));
      --checkout-left-fr: 1.1fr;
      --checkout-right-fr: 0.9fr;
      --checkout-left-max: calc(var(--checkout-content-max) * var(--checkout-left-ratio));
      --checkout-right-max: calc(var(--checkout-content-max) * var(--checkout-right-ratio));
    `,
    main: css`
      display: flex;
      flex-direction: column;
      height: 100%;

      ${mq.lg} {
        display: grid;
        grid-template-columns: var(--checkout-left-fr) var(--checkout-right-fr);
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
        max-width: var(--checkout-left-max);
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
        max-width: var(--checkout-right-max);
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
