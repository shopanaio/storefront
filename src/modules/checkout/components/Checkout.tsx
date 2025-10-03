'use client';

import { Flex } from 'antd';
import { useTranslations } from 'next-intl';
import { createStyles } from 'antd-style';
import { mq } from '@src/components/Theme/breakpoints';
import { Summary } from './summary/Summary';
import { FormProvider, useForm } from 'react-hook-form';
import { CheckoutActions } from './submit/CheckoutActions';
import { SectionRenderer } from '@src/modules/checkout/infra/loaders/SectionRenderer';
import { Entity } from '@src/entity';
import { CheckoutAuth } from './CheckoutAuth';
import { useState } from 'react';

import '@src/modules/checkout/sections/autoload';

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
    /** Optional ISO country code to control which blocks are shown */
    country?: 'UA' | 'INTL';
  };
}

export interface CheckoutFormValues {
  userPhone: string;
  userName: string;
  userFirstName?: string;
  userLastName?: string;
  userMiddleName?: string;
  /** Whether the purchaser is the same person as the recipient */
  isRecipientSelf?: boolean;
  /** Separate recipient fields when isRecipientSelf === false */
  recipientFirstName?: string;
  recipientLastName?: string;
  recipientMiddleName?: string;
  /** Optional order comment / delivery note */
  orderComment?: string;
  /**
   * The base checkout keeps only generic fields. Vendor-specific
   * shipping/payment state lives inside vendor modules via useFormContext.
   */
  selectedShippingMethod?: { code: string } | null;
  selectedPaymentMethod?: { code: string } | null;
  /** UA/INTL address fields (kept generic here) */
  userCity?: any;
  userStreet?: any;
  userBuilding?: string;
  userApartment?: string;
  userWarehouse?: any;
}

/**
 * Checkout form component that renders contact, shipping, and payment sections.
 * Feature flags can adjust visible UI (e.g., `features.auth` shows login button).
 */
export const Checkout = ({ cart, onConfirm, brand, features }: Prop) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const [validationError, setValidationError] = useState<string | null>(null);

  const defaultDeliveryGroup = (cart as any)?.deliveryGroups?.[0];
  const defaultSelectedShippingMethod =
    defaultDeliveryGroup?.selectedDeliveryMethod
      ? { code: defaultDeliveryGroup?.selectedDeliveryMethod?.code }
      : null;
  const defaultSelectedPaymentMethod = (cart as any)?.payment
    ?.selectedPaymentMethod
    ? { code: (cart as any)?.payment?.selectedPaymentMethod?.code }
    : null;

  const methods = useForm<CheckoutFormValues>({
    defaultValues: {
      userPhone: '',
      userName: '',
      isRecipientSelf: true,
      selectedShippingMethod: defaultSelectedShippingMethod,
      selectedPaymentMethod: defaultSelectedPaymentMethod,
    },
  });

  // Attach cart to form context for sections to access
  (methods as any).cart = cart;

  const { handleSubmit } = methods;

  const onSubmit = (data: CheckoutFormValues) => {
    // Clear previous validation error
    setValidationError(null);

    const missingShipping = !data.selectedShippingMethod;
    const missingPayment = !data.selectedPaymentMethod;

    // Check if both methods are missing
    if (missingShipping && missingPayment) {
      setValidationError(t('error-no-shipping-and-payment-method'));
      return;
    }

    // Check if shipping method is missing
    if (missingShipping) {
      setValidationError(t('error-no-shipping-method'));
      return;
    }

    // Check if payment method is missing
    if (missingPayment) {
      setValidationError(t('error-no-payment-method'));
      return;
    }

    // All validations passed, proceed with submission
    onConfirm();
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.container}>
            <div className={styles.main}>
              <Flex className={styles.left}>
                {brand}
                <SectionRenderer
                  slug="contact"
                  headerAction={
                    features?.auth ? (
                      <CheckoutAuth className={styles.logInButton} />
                    ) : undefined
                  }
                />
                <SectionRenderer slug="delivery" />
                <SectionRenderer slug="recipient" />
                <SectionRenderer slug="payment" />

                <div className={styles.actionsLeft}>
                  <CheckoutActions
                    validationError={validationError}
                    onClearError={() => setValidationError(null)}
                  />
                </div>
              </Flex>
              <Flex className={styles.rightContainer}>
                <Flex vertical gap={12} className={styles.right}>
                  {cart ? <Summary cart={cart} /> : null}
                  <div className={styles.actionsRight}>
                    <CheckoutActions
                      validationError={validationError}
                      onClearError={() => setValidationError(null)}
                    />
                  </div>
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
      --checkout-left-max: calc(
        var(--checkout-content-max) * var(--checkout-left-ratio)
      );
      --checkout-right-max: calc(
        var(--checkout-content-max) * var(--checkout-right-ratio)
      );
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
        top: 0;
        align-self: flex-start;
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

    logInButton: css`
      padding: 0;
    `,
  };
});
