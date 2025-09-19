"use client";

import React from "react";
import { Button, Divider, Typography } from "antd";
import { TbInfoCircle } from "react-icons/tb";
import { createStyles, css } from "antd-style";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { SelectOption } from "@src/components/Product/Options/OptionSelect";
import { SwatchOption } from "@src/components/Product/Options/OptionSwatch";
import { RadioOption } from "@src/components/Product/Options/OptionRadio";

import {
  UiOption,
  UiOptionValue,
  useFlattenProductOptions,
} from "@src/hooks/useFlattenProductOptions";
import { ApiProduct, ProductOptionDisplayType } from "@codegen/schema-client";
import { useRoutes } from "@src/hooks/useRoutes";
import { VariantCoverOption } from "@src/components/Product/Options/OptionVariantCover";

const { Text } = Typography;

interface ProductOptionsProps {
  product: ApiProduct;
  onOptionSelect?: (optionId: string, value: UiOptionValue) => void;
}

export const ProductOptions = ({
  product,
  onOptionSelect,
}: ProductOptionsProps) => {
  const t = useTranslations("Product");
  const { styles } = useStyles();
  const router = useRouter();
  const routes = useRoutes();

  const optionGroups = useFlattenProductOptions(
    product.options,
    product.variants,
    product
  );

  const handleOptionSelect = (optionId: string) => (value: UiOptionValue) => {
    // If variant exists for selected value, redirect to its page
    if (value.variant?.handle) {
      const variantPath = routes.product.path(value.variant.handle);
      router.push(variantPath);
    }

    // Call user callback if provided
    onOptionSelect?.(optionId, value);
  };

  const renderOption = (option: UiOption) => {
    switch (option.displayType) {
      case ProductOptionDisplayType.Swatch:
        return (
          <SwatchOption
            title={option.title}
            values={option.values}
            onSelect={handleOptionSelect(option.id)}
            product={product}
          />
        );
      case ProductOptionDisplayType.VariantCover:
        return (
          <VariantCoverOption
            title={option.title}
            values={option.values}
            onSelect={handleOptionSelect(option.id)}
          />
        );
      case ProductOptionDisplayType.Radio:
        return (
          <RadioOption
            title={option.title}
            values={option.values}
            onSelect={handleOptionSelect(option.id)}
          />
        );
      case ProductOptionDisplayType.Dropdown:
      case ProductOptionDisplayType.ApparelSize:
        return (
          <>
            <SelectOption
              title={option.title}
              values={option.values}
              onSelect={handleOptionSelect(option.id)}
            />
            {option.displayType === ProductOptionDisplayType.ApparelSize && (
              <Button
                className={styles.optionAdditionInfo}
                icon={<TbInfoCircle />}
                type="link"
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
