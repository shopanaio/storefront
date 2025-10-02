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

export interface City {
  AddressDeliveryAllowed: boolean;
  Area: string;
  DeliveryCity: string;
  MainDescription: string;
  ParentRegionCode: string;
  ParentRegionTypes: string;
  Present: string;
  Ref: string;
  Region: string;
  RegionTypes: string;
  RegionTypesCode: string;
  SettlementTypeCode: string;
  StreetsAvailability: boolean;
  Warehouses: number;
}

export interface Warehouse {
  id: string;
  type: string;
  Number: string;
  address: string;
  schedule: string;
  cityRef: string;
  cityName: string;
  RegionCity: string;
  ShortAddress: string;
  Schedule: string;
  typeOfWarehouse: string;
}

export interface Street {
  id: string;
  name: string;
}

export interface CheckoutFormValues {
  userPhone: string;
  userName: string;
  userHouse: string;
  userApartment: string;

  activeShippingKey: string;
  userCity: City | null;
  userStreet: Street | null;
  userWarehouse: Warehouse | null;

  payment: string;
  shippingAsBilling: boolean;

  cardNumber: string;
  expirationDate: string;
  cvv: string;

  billingCountry: string;
  billingFirstName: string;
  billingLastName: string;
  billingCompany: string;
  billingAddress: string;
  billingApartment: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingPhone: string;
}

export const Checkout = ({ cart, onConfirm, brand }: Prop) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();

  const defaultDeliveryGroup = cart?.deliveryGroups?.[0];
  const defaultShippingKey = defaultDeliveryGroup?.selectedDeliveryMethod?.code;
  const defaultPayment = defaultDeliveryGroup?.deliveryMethods?.[0]?.code || '';

  const methods = useForm<CheckoutFormValues>({
    defaultValues: {
      userPhone: '',
      userName: '',
      userHouse: '',
      userApartment: '',
      activeShippingKey: defaultShippingKey,
      userCity: null,
      userStreet: null,
      userWarehouse: null,
      payment: defaultPayment,
      shippingAsBilling: false,

      cardNumber: '',
      expirationDate: '',
      cvv: '',

      billingCountry: '',
      billingFirstName: '',
      billingLastName: '',
      billingCompany: '',
      billingAddress: '',
      billingApartment: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
      billingPhone: '',
    },
  });

  const { control, handleSubmit, setValue, watch } = methods;

  const activeShippingKey = watch('activeShippingKey');
  const activePayment = watch('payment');
  const shippingAsBilling = watch('shippingAsBilling');

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
                  {cart?.deliveryGroups?.[0]?.deliveryMethods && (
                    <ShippingMethods
                      methods={cart?.deliveryGroups?.[0]?.deliveryMethods || []}
                      activeShippingKey={activeShippingKey}
                      setValue={setValue}
                      control={control}
                      watch={watch}
                    />
                  )}
                </Flex>
                <Flex vertical gap={12}>
                  <Text className={styles.sectionTitle} strong>
                    {t('payment')}
                  </Text>
                  {cart?.payment?.paymentMethods && (
                    <PaymentMethods
                      methods={(cart as any)?.payment?.paymentMethods || []}
                      activePayment={activePayment}
                      shippingAsBilling={shippingAsBilling}
                      setValue={setValue}
                      control={control}
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
                  <Summary cart={cart} onConfirm={onConfirm} />
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
