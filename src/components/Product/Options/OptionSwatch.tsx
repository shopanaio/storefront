"use client";

import { Flex, Image } from "antd";
import { createStyles } from "antd-style";
import { OptionDrawerLayout } from "./DrawerLayout";
import { useState } from "react";
import { UiOptionValue } from "@src/hooks/useFlattenProductOptions";
import { OptionHeader } from "./Header";
import type { model } from "@shopana/storefront-sdk/model/namespace";
import { OptionRadioButton } from "@src/components/Product/Options/OptionRadioButton";
import { OptionGrid } from "@src/components/UI/OptionGrid";

interface Props {
  title: string;
  values: UiOptionValue[];
  onSelect: (value: UiOptionValue) => void;
  product: model.Product;
}

export const SwatchOption = ({ title, values, onSelect, product }: Props) => {
  const { styles } = useStyles();
  const [open, setOpen] = useState(false);

  const [draftValue, setDraftValue] = useState<UiOptionValue | null>(
    values.find((v) => v.isActive) || null
  );

  const showDrawer = () => {
    setDraftValue(values.find((v) => v.isActive) || null);
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);

    if (draftValue) {
      onSelect(draftValue);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Flex vertical gap={16}>
        <OptionHeader
          title={title}
          value={values.find((v) => v.isActive) || null}
          onClick={showDrawer}
        />
        <OptionGrid gap="sm" columns="auto-fit">
          {values.map((option, index) => (
            <OptionRadioButton
              key={index}
              selected={option.isActive}
              disabled={!option.variant}
              onClick={() => onSelect(option)}
            >
              <div className={styles.colorCircleOuter}>
                <div
                  className={styles.colorCircleInner}
                  style={{
                    backgroundColor: option.swatch?.color || "#fff",
                  }}
                />
              </div>
            </OptionRadioButton>
          ))}
        </OptionGrid>
      </Flex>
      <OptionDrawerLayout
        open={open}
        title={title}
        onClose={handleCancel}
        footer={{
          selectedLabel: draftValue?.title || product.title,
          onConfirm: handleConfirm,
        }}
      >
        <Flex vertical gap={16}>
          <Image
            className={styles.image}
            src={draftValue?.variant?.cover?.url}
            alt={draftValue?.variant?.title || draftValue?.title || product.title}
          />
          <OptionGrid columns={4} gap="sm">
            {values.map((option, index) => (
              <OptionRadioButton
                key={index}
                selected={draftValue?.id === option.id}
                onClick={() => setDraftValue(option)}
                disabled={!option.variant}
                showRadio={false}
              >
                <div className={styles.colorCircleOuter}>
                  <div
                    className={styles.colorCircleInner}
                    style={{
                      backgroundColor: option.swatch?.color || "#fff",
                    }}
                  />
                </div>
              </OptionRadioButton>
            ))}
          </OptionGrid>
        </Flex>
      </OptionDrawerLayout>
    </>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  image: css`
    width: 100%;
    height: 100%;
    object-fit: cover;
    aspect-ratio: 1/1;
    border-radius: ${token.borderRadius}px;
  `,
  colorCircleOuter: css`
    padding: ${token.paddingXXS}px;
    border: 1px solid ${token.colorBorder};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  colorCircleInner: css`
    width: ${token.sizeMD}px;
    height: ${token.sizeMD}px;
    border-radius: 50%;
  `,
}));
