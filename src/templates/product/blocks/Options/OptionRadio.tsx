"use client";

import { Flex } from "antd";
import { createStyles } from "antd-style";
import { useState } from "react";
import { OptionDrawerLayout } from "./DrawerLayout";
import { UiOptionValue } from "@src/hooks/useFlattenProductOptions";
import { OptionHeader } from "./OptionHeader";
import { OptionRadioButton } from "./OptionRadioButton";
import { DrawerGrid } from "./DrawerGrid";
import { OptionFlex, OptionGrid } from "@src/components/UI/OptionGrid";

interface Props {
  title: string;
  values: UiOptionValue[];
  onSelect: (value: UiOptionValue) => void;
}

export const RadioOption = ({ title, values, onSelect }: Props) => {
  const { styles } = useStyles();

  const [open, setOpen] = useState(false);

  /* Draft selection inside the drawer */
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
      <Flex className={styles.container} vertical gap={16}>
        <OptionHeader
          title={title}
          value={values.find((v) => v.isActive) || null}
          onClick={showDrawer}
        />
      </Flex>

      <OptionFlex gap="sm">
        {values.map((value) => (
          <OptionRadioButton
            key={value.id}
            selected={value.isActive}
            disabled={!value.variant}
            onClick={() => onSelect(value)}
            className={styles.option}
          >
            {value.title}
          </OptionRadioButton>
        ))}
      </OptionFlex>

      <OptionDrawerLayout
        open={open}
        title={title}
        onClose={handleCancel}
        footer={{
          selectedLabel: draftValue?.title || "",
          onConfirm: handleConfirm,
        }}
      >
        <DrawerGrid columns={1}>
          {values.map((value, index) => (
            <OptionRadioButton
              key={index}
              selected={draftValue?.id === value.id}
              disabled={!value.variant}
              showRadio
              onClick={() => {
                setDraftValue(value);
              }}
            >
              {value.title}
            </OptionRadioButton>
          ))}
        </DrawerGrid>
      </OptionDrawerLayout>
    </>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 0;
  `,
  option: css`
    max-width: fit-content;
    padding-inline: ${token.padding}px !important;
  `,
}));
