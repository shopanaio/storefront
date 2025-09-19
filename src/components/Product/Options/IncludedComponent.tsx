"use client";

import { Flex, Image, Typography } from "antd";
import { createStyles, cx } from "antd-style";
import { useState } from "react";
import { OptionsDrawer } from "./OptionsDrawer";
import { ApiProduct } from "@codegen/schema-client";
import { fallbackImageBase64 } from "@src/components/Listing/fallbackImageBase64";
import { mq } from "@src/components/Theme/breakpoints";
import { OptionCard } from "@src/components/UI/OptionCard";
import { OptionImage } from "@src/components/UI/OptionImage";
import { ProductCardTitle } from "@src/components/UI/ProductCards/Title/Title";
import { IncludedInSetBadge } from "./IncludedInSetBadge";
import { OptionDrawerLayout } from "@src/components/Product/Options/DrawerLayout";

const { Text } = Typography;

interface Props {
  option: ApiProduct;
}

export const IncludedComponent = ({ option }: Props) => {
  const { styles } = useStyles();
  const [open, setOpen] = useState(false);

  const showDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);

  return (
    <>
      <OptionCard onClick={showDrawer} control="chevron">
        <Flex align="center" gap={8}>
          <OptionImage src={option.cover?.url} alt={option.title} />
          <Flex vertical align="start">
            <IncludedInSetBadge color="primary" />
            <ProductCardTitle rows={2} size="default">
              {option.title}
            </ProductCardTitle>
          </Flex>
        </Flex>
      </OptionCard>
      <OptionsDrawer open={open} onClose={closeDrawer}>
        <OptionDrawerLayout
          onClose={closeDrawer}
          title={<IncludedInSetBadge size="large" />}
        >
          <Image
            className={styles.cover}
            src={option.cover?.url}
            alt={option.title}
            loading="lazy"
            preview={false}
            fallback={fallbackImageBase64}
          />

          <Text strong>{option.title}</Text>
          <Text>{option.description}</Text>
        </OptionDrawerLayout>
      </OptionsDrawer>
    </>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  optionDrawerTitle: css`
    font-size: ${token.fontSize}px;
    font-weight: 600;

    ${mq.lg} {
      font-size: ${token.fontSizeLG}px;
    }
  `,
  variantsGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
    gap: ${token.marginSM}px;
  `,
  optionImg: css`
    max-width: calc(var(--thumb-size) - 4px);
    border-radius: ${token.borderRadius}px;
    aspect-ratio: 1/1;
    object-fit: cover;
  `,
  colorPrimary: css`
    fill: ${token.colorPrimary};
    color: ${token.colorPrimary};
  `,
  cover: css`
    width: 100%;
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorBorder};
  `,
  closeBtn: css`
    &:hover {
      color: ${token.colorPrimary} !important;
    }
  `,
  footerWrapper: css`
    position: sticky;
    bottom: 0;
    gap: ${token.margin}px;
    margin-top: auto;
    padding: ${token.padding}px 0 ${token.padding}px;
    background-color: ${token.colorBgBase};
  `,
  colorBtn: css`
    height: 100%;
    padding: ${token.paddingXXS}px;
    border-radius: ${token.borderRadius}px;
    transition: all 0.2s ease;
  `,
  selectedOption: css`
    outline: 2px solid ${token.colorPrimary};
  `,
  colorCircle: css`
    width: ${token.sizeLG}px;
    height: ${token.sizeLG}px;
    border-radius: 50%;
    border: 1px solid ${token.colorBorderSecondary};
  `,
}));
