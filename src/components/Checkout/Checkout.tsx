"use client";

import { Button, Flex, Typography } from "antd";
import { useTranslations } from "next-intl";
import { createStyles } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";
import { ApiCart } from "@codegen/schema-client";
import { Summary } from "./Summary";
import { useForm } from "react-hook-form";
import { PaymentMethods } from "./Payment/PaymentMethods";
import { ShippingMethods } from "./Shipping/ShippingMethods";
import { PhoneInputField } from "./PhoneInputField";

const { Text } = Typography;

interface Prop {
  cart: ApiCart;
  onConfirm: () => void;
  methods: ApiCart;
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

export const Checkout = ({ cart, onConfirm, methods }: Prop) => {
  const t = useTranslations("Checkout");
  const { styles } = useStyles();

  const defaultShippingKey =
    methods?.shippingDetails?.selectedMethod?.handle || "";

  const defaultPayment = methods?.paymentDetails?.selectedMethod?.handle || "";
  /* console.log(cart); */

  const { control, handleSubmit, setValue, watch } =
    useForm<CheckoutFormValues>({
      defaultValues: {
        userPhone: "",
        userName: "",
        userHouse: "",
        userApartment: "",
        activeShippingKey: defaultShippingKey,
        userCity: null,
        userStreet: null,
        userWarehouse: null,
        payment: defaultPayment,
        shippingAsBilling: false,

        cardNumber: "",
        expirationDate: "",
        cvv: "",

        billingCountry: "",
        billingFirstName: "",
        billingLastName: "",
        billingCompany: "",
        billingAddress: "",
        billingApartment: "",
        billingCity: "",
        billingState: "",
        billingZip: "",
        billingPhone: "",
      },
    });

  const activeShippingKey = watch("activeShippingKey");
  const activePayment = watch("payment");
  const shippingAsBilling = watch("shippingAsBilling");

  const onSubmit = (data: CheckoutFormValues) => {};

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.container}>
        <div className={styles.main}>
          <Flex className={styles.contactShippingSection}>
            <Flex vertical gap={12}>
              <Flex justify="space-between" align="center">
                <Text className={styles.sectionTitle} strong>
                  {t("contact")}
                </Text>
                <Button type="link">{t("log-in")}</Button>
              </Flex>

              <PhoneInputField
                control={control}
                name="userPhone"
                label={t("phone-number")}
                placeholder={t("phone")}
              />
            </Flex>

            <Flex vertical gap={12}>
              <Text className={styles.sectionTitle} strong>
                {t("shipping")}
              </Text>

              {methods?.shippingDetails && (
                <ShippingMethods
                  methods={methods?.shippingDetails?.availableMethods || []}
                  activeShippingKey={activeShippingKey}
                  setValue={setValue}
                  control={control}
                  watch={watch}
                />
              )}
            </Flex>

            <Flex vertical gap={12}>
              <Text className={styles.sectionTitle} strong>
                {t("payment")}
              </Text>

              {methods?.paymentDetails && (
                <PaymentMethods
                  methods={methods?.paymentDetails?.availableMethods || []}
                  activePayment={activePayment}
                  shippingAsBilling={shippingAsBilling}
                  setValue={setValue}
                  control={control}
                />
              )}
            </Flex>
          </Flex>

          <Flex className={styles.orderSummaryBg}>
            <Flex vertical gap={12} className={styles.orderSummarySection}>
              <Summary cart={cart} onConfirm={onConfirm} />
            </Flex>
          </Flex>
        </div>
      </div>
    </form>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: ${token.padding}px 0;
    `,

    main: css`
      display: flex;
      flex-direction: column;
      height: 100%;

      ${mq.lg} {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }

      --width: 1280px;
      --offset: calc((100vw - var(--width)) / 2);

      --left-column-width: 737px;
      --right-column-width: calc(
        var(--width) - var(--left-column-width) + var(--offset)
      );

      ${mq.xl} {
        display: grid;
        justify-content: end;
        grid-template-columns: var(--left-column-width) var(
            --right-column-width
          );
      }

      ${mq.xxl} {
        --width: 1400px;
        --left-column-width: 850px;
      }
    `,

    contactShippingSection: css`
      flex-direction: column;
      gap: ${token.marginMD}px;

      padding: ${token.paddingXS}px ${token.padding}px;

      ${mq.lg} {
        padding: ${token.paddingXS}px ${token.paddingXL}px ${token.paddingXS}px
          ${token.padding}px;
      }

      ${mq.xl} {
        padding: ${token.paddingXS}px ${token.paddingXL}px ${token.paddingXL}px
          ${token.padding}px;
      }
    `,

    sectionTitle: css`
      font-size: ${token.fontSizeLG}px;

      ${mq.lg} {
        font-size: ${token.fontSizeLG}px;
      }

      ${mq.xl} {
        font-size: ${token.fontSizeXL}px;
      }
    `,

    methodTitle: css`
      ${mq.xxl} {
        font-size: ${token.fontSizeLG}px;
      }
    `,

    orderSummaryBg: css`
      background-color: ${token.colorBgLayout};
      width: 100%;
    `,

    orderSummarySection: css`
      padding: ${token.paddingXS}px ${token.padding}px;
      width: 100%;

      ${mq.lg} {
        position: sticky;
        height: 100vh;
        top: 0;
        width: 100%;
      }

      --width: 1280px;
      --offset: calc((100vw - var(--width)) / 2);

      --left-column-width: 737px;

      ${mq.xl} {
        width: calc(var(--width) - var(--left-column-width));
      }
    `,
  };
});
