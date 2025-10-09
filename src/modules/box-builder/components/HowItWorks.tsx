"use client";

import { Flex, Steps, Typography } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import { TbGift } from "react-icons/tb";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { BsPostcardHeart } from "react-icons/bs";
import { MdShoppingCartCheckout } from "react-icons/md";
import { Intro } from "@src/modules/box-builder/Images/Intro";

const { Text } = Typography;

export default function HowItWorks() {
  const { styles } = useStyles();
  const t = useTranslations("BoxBuilder");

  return (
    <>
      <Flex vertical align="center" gap={8}>
        <div className={styles.lottieContainer}>
          <Intro />
        </div>
        <Text className={styles.title}>{t("title")}</Text>
        <Text className={styles.description}>{t("description")}</Text>
      </Flex>

      <Flex vertical gap={16}>
        <Text className={styles.subtitle} strong>
          {t("how-it-works")}
        </Text>

        <Flex vertical>
          <Steps
            direction="vertical"
            items={[
              {
                title: (
                  <Text className={styles.stepTitle} strong>
                    {t("choose-box")}
                  </Text>
                ),
                description: (
                  <Text className={styles.stepDescription}>
                    {t("choose-box-description")}
                  </Text>
                ),
                icon: <TbGift size={32} className={styles.stepImg} />,
              },
              {
                title: (
                  <Text className={styles.stepTitle} strong>
                    {t("choose-products")}
                  </Text>
                ),
                description: (
                  <Text className={styles.stepDescription}>
                    {t("choose-products-description")}
                  </Text>
                ),
                icon: (
                  <FaWandMagicSparkles size={32} className={styles.stepImg} />
                ),
              },
              {
                title: (
                  <Text className={styles.stepTitle} strong>
                    {t("choose-card")}
                  </Text>
                ),
                description: (
                  <Text className={styles.stepDescription}>
                    {t("choose-card-description")}
                  </Text>
                ),
                icon: <BsPostcardHeart size={32} className={styles.stepImg} />,
              },
              {
                title: (
                  <Text className={styles.stepTitle} strong>
                    {t("place-order")}
                  </Text>
                ),
                description: (
                  <Text className={styles.stepDescription}>
                    {t("place-order-description")}
                  </Text>
                ),
                icon: (
                  <MdShoppingCartCheckout
                    size={32}
                    className={styles.stepImg}
                  />
                ),
              },
            ]}
          />
        </Flex>
      </Flex>
    </>
  );
}

const useStyles = createStyles(({ token, css }) => {
  return {
    title: css`
      font-size: 32px;
      line-height: 38px;
      font-weight: 900;
      max-width: 370px;
      text-align: center;
      background: linear-gradient(
        to right,
        ${token.colorPrimary},
        ${token["cyan-6"]}
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    `,

    description: css`
      max-width: 345px;
      text-align: center;
      color: ${token.colorTextSecondary};
      font-size: ${token.fontSizeLG}px;
    `,

    swiperContainer: css`
      width: 100%;
      height: calc(100vw / 4);
      position: relative;
      overflow: hidden;

      .swiper-wrapper {
        transition-timing-function: linear !important;
      }

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 52px;
        height: 100%;
        background: linear-gradient(
          to right,
          ${token.colorBgContainer} 0%,
          transparent 100%
        );
        z-index: 2;
        pointer-events: none;
      }

      &::after {
        content: "";
        position: absolute;
        right: 0;
        top: 0;
        width: 52px;
        height: 100%;
        background: linear-gradient(
          to left,
          ${token.colorBgContainer} 0%,
          transparent 100%
        );
        z-index: 1;
        pointer-events: none;
      }
    `,

    swiperImage: css`
      width: auto;
      height: 100%;
      object-fit: cover;
    `,

    waveDivider: css`
      color: ${token.colorPrimary};
    `,

    subtitle: css`
      font-size: 20px;
      text-align: center;
    `,

    stepImg: css`
      color: ${token.colorPrimary};
    `,

    stepTitle: css`
      font-size: ${token.fontSizeLG}px;
    `,

    stepDescription: css`
      color: ${token.colorTextSecondary};
    `,

    lottieContainer: css`
      width: 230px;
      height: 150px;
      display: flex;
      justify-content: center;
      align-items: center;
    `,
  };
});
