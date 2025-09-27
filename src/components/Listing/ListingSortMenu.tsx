"use client";

import React, { useState } from "react";
import { Button, Flex } from "antd";
import { TbArrowsUpDown } from "react-icons/tb";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import { ListingSort } from "@codegen/schema-client";
import { mq } from "@src/components/Theme/breakpoints";
import { DrawerBase } from "@src/components/UI/DrawerBase";
import { OptionRadioButton } from "@src/components/Product/Options/OptionRadioButton";

export interface SortOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface Props {
  options: SortOption<ListingSort | "Newest first">[];
  value: ListingSort;
  onChange: (value: ListingSort) => void;
}

export const ListingSortMenu = ({ options, value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const { styles } = useStyles();
  const t = useTranslations("Listing");
  const s = useTranslations("Sort");


  const showDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);

  return (
    <>
      <Button
        className={styles.drawerBtn}
        icon={<TbArrowsUpDown />}
        onClick={showDrawer}
      >
        {options.find((o) => o.value === value)?.label ?? t("sort")}
      </Button>

      <DrawerBase
        open={open}
        onClose={closeDrawer}
        title={s("sort-by")}
      >
        <Flex vertical gap={8}>
          {options.map((option) => (
            <OptionRadioButton
              key={option.value}
              selected={value === option.value}
              disabled={option.disabled}
              showRadio
              onClick={() => {
                if (!option.disabled) {
                  onChange(option.value as ListingSort);
                  setOpen(false);
                }
              }}
            >
              {option.label}
            </OptionRadioButton>
          ))}
        </Flex>
      </DrawerBase>
    </>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  drawerBtn: css`
    display: flex;
    justify-content: start;
    width: 100%;
    border-radius: ${token.borderRadius}px;
    border-color: ${token.colorBorder};

    ${mq.lg} {
      width: fit-content;
    }
  `,
}));
