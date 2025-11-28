"use client";

import { Flex, Image, Typography } from "antd";
import { createStyles } from "antd-style";
import { mq } from "@src/ui-kit/Theme/breakpoints";
import type { HomeProduct } from "@shopana/storefront-sdk/modules/home/core/types";
import { Price } from "@src/ui-kit/Price/Price";
import { calcSale } from "@src/utils/calcSale";
import { fallbackImageBase64 } from "@src/ui-kit/fallbackImageBase64";

const { Text } = Typography;

interface Prop {
  banner: HomeProduct;
}

export default function Banner({ banner }: Prop) {
  const { styles } = useStyles();

  const sale = calcSale(banner?.compareAtPrice?.amount, banner?.price?.amount);

  return (
    <div className={styles.banner}>
      <Image
        loading="lazy"
        src={banner?.image?.url || ""}
        alt={banner?.title || ""}
        width="100%"
        className={styles.bannerImg}
        preview={false}
        fallback={fallbackImageBase64}
      />
      <div className={styles.bannerContentWrapper}>
        <Flex className={styles.bannerContent} vertical gap={4}>
          {sale && <div className={styles.discount}>-{sale}% OFF</div>}
          <Text className={styles.bannerTitle} strong>
            {banner?.title}
          </Text>
          <Text className={styles.bannerDescription}>
            {banner?.description}
          </Text>

          {banner?.price && (
            <Text className={styles.bannerPrice} strong>
              <Price money={banner.price} />
            </Text>
          )}
        </Flex>
      </div>
    </div>
  );
}

const useStyles = createStyles(({ css, token }) => {
  return {
    banner: css`
      position: relative;
      border-radius: ${token.borderRadiusLG}px;
      overflow: hidden;
      position: relative;
      aspect-ratio: 1/1;
    `,

    bannerImg: css`
      position: relative;
      width: 100%;
      height: 100%;
      object-fit: cover;
    `,

    bannerContentWrapper: css`
      position: absolute;
      bottom: 0;
      left: 0;
      height: 100%;
      width: 100%;

      &::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        background: linear-gradient(
          120deg,
          ${token.colorPrimary} 100%,
          ${token.colorPrimary} 100%
        );
        opacity: 0.5;
      }

      & > * {
        position: relative;
        z-index: 1;
      }
    `,

    bannerContent: css`
      margin-top: ${token.marginXXL}px;
      margin-left: ${token.marginXL}px;
    `,

    discount: css`
      width: fit-content;
      background-color: ${token.colorPrimary};
      color: ${token.colorTextLightSolid};
      padding: ${token.paddingXXS}px ${token.paddingXS}px;
      border-radius: ${token.borderRadius}px;
      font-size: 12px;
    `,

    bannerTitle: css`
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-word;
      white-space: normal;

      font-size: 18px;
      color: ${token.colorTextLightSolid};

      ${mq.lg} {
        font-size: 20px;
      }

      ${mq.xl} {
        font-size: 24px;
      }
    `,

    bannerDescription: css`
      font-size: 12px;
      color: ${token.colorTextLightSolid};
    `,

    bannerPrice: css`
      font-size: 24px;
      color: ${token.colorTextLightSolid};
    `,
  };
});
