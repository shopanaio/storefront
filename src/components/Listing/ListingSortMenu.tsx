'use client';

import React, { useEffect, useState } from 'react';
import { Button, Flex } from 'antd';
import { TbArrowsUpDown } from 'react-icons/tb';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { ListingSort } from '@codegen/schema-client';
import { mq } from '@src/components/Theme/breakpoints';
import { DrawerBase } from '@src/components/UI/DrawerBase';
import { OptionRadioButton } from '@src/templates/product/blocks/Options/OptionRadioButton';
import { StickyButton } from '@src/components/UI/StickyButton';

export interface SortOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface Props {
  options: SortOption<ListingSort | 'Newest first'>[];
  value: ListingSort;
  onChange: (value: ListingSort) => void;
}

type SortValue = ListingSort | 'Newest first';

export const ListingSortMenu = ({ options, value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState<SortValue>(value);
  const { styles } = useStyles();
  const t = useTranslations('Listing');
  const s = useTranslations('Sort');

  const showDrawer = () => {
    setPendingValue(value);
    setOpen(true);
  };

  const closeDrawer = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!open) {
      setPendingValue(value);
    }
  }, [open, value]);

  const handleApplySort = () => {
    closeDrawer();
    if (pendingValue !== value) {
      onChange(pendingValue as ListingSort);
    }
  };

  const footerContent = (
    <StickyButton
      onClick={handleApplySort}
      label={s('apply-sort')}
      disabled={pendingValue === value}
    />
  );

  return (
    <>
      <Button
        className={styles.drawerBtn}
        icon={<TbArrowsUpDown />}
        onClick={showDrawer}
      >
        {options.find((o) => o.value === value)?.label ?? t('sort')}
      </Button>
      <DrawerBase
        open={open}
        onClose={closeDrawer}
        title={s('sort-by')}
        footer={footerContent}
        engine="vaul"
      >
        <Flex vertical gap={8}>
          {options.map((option) => (
            <OptionRadioButton
              key={option.value}
              selected={pendingValue === option.value}
              disabled={option.disabled}
              showRadio
              onClick={() => {
                if (!option.disabled) {
                  setPendingValue(option.value as SortValue);
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
