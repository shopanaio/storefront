"use client";

import React from "react";
import { Button, Divider } from "antd";
import { TbInfoCircle } from "react-icons/tb";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import { SelectOption } from "./OptionSelect";
import { SwatchOption } from "./OptionSwatch";
import { RadioOption } from "./OptionRadio";

import {
  UiOption,
  UiOptionValue,
  useFlattenProductOptions,
} from "@src/hooks/useFlattenProductOptions";
import type { model } from "@shopana/storefront-sdk";
import { VariantCoverOption } from "./OptionVariantCover";

// Note: Typography.Text is not used here currently

interface ProductOptionsProps {
  product: model.Product;
  currentVariant?: model.ProductVariant | model.Product;
  onOptionSelect?: (optionId: string, value: UiOptionValue) => void;
}

export const ProductOptions = ({
  product,
  currentVariant,
  onOptionSelect,
}: ProductOptionsProps) => {
  const t = useTranslations("Product");
  const { styles } = useStyles();

  const optionGroups = useFlattenProductOptions(
    product.options,
    product.variants,
    (currentVariant ?? product) as unknown as model.ProductVariant
  );

  const handleOptionSelect = (optionId: string) => (value: UiOptionValue) => {
    // Emit selection upwards; parent decides how to handle URL update
    onOptionSelect?.(optionId, value);
  };

  const renderOption = (option: UiOption) => {
    switch (option.displayType) {
      case 'SWATCH':
        return (
          <SwatchOption
            title={option.title}
            values={option.values}
            onSelect={handleOptionSelect(option.id)}
            product={product}
          />
        );
      case 'VARIANT_COVER':
        return (
          <VariantCoverOption
            title={option.title}
            values={option.values}
            onSelect={handleOptionSelect(option.id)}
          />
        );
      case 'RADIO':
        return (
          <RadioOption
            title={option.title}
            values={option.values}
            onSelect={handleOptionSelect(option.id)}
          />
        );
      case 'DROPDOWN':
      case 'APPAREL_SIZE':
        return (
          <>
            <SelectOption
              title={option.title}
              values={option.values}
              onSelect={handleOptionSelect(option.id)}
            />
            {option.displayType === 'APPAREL_SIZE' && (
              <Button
                className={styles.optionAdditionInfo}
                icon={<TbInfoCircle />}
                variant="link"
                color="primary"
              >
                {t("size-chart")}
              </Button>
            )}
          </>
        );

      default:
        return null;
    }
  };

  if (optionGroups.length === 0) {
    return null;
  }

  return (
    <>
      {/* <Text className={styles.title}>{t("select-options")}</Text> */}
      {optionGroups.map((option) => (
        <React.Fragment key={option.id}>
          {renderOption(option)}
          <Divider className={styles.divider} />
        </React.Fragment>
      ))}
    </>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  optionAdditionInfo: css`
    display: flex;
    justify-content: start;
    width: max-content;
    padding: 0;
  `,
  divider: css`
    margin-top: 0;
    margin-bottom: 0;
  `,
  title: css`
    font-size: ${token.fontSizeLG}px;
    font-weight: 600;
  `,
}));
