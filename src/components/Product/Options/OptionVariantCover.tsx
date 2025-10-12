"use client";

import { Flex, Radio } from "antd";
import { useState } from "react";
import { OptionDrawerLayout } from "./DrawerLayout";
import { DrawerGrid } from "./DrawerGrid";
import { UiOptionValue } from "@src/hooks/useFlattenProductOptions";
import { OptionHeader } from "./Header";
import { OptionGrid } from "@src/components/UI/OptionGrid";
import { Thumbnail } from "@src/components/UI/Thumbnail/Thumbnail";

interface Props {
  title: string;
  values: UiOptionValue[];
  onSelect: (value: UiOptionValue) => void;
}

export const VariantCoverOption = ({ title, values, onSelect }: Props) => {
  const [open, setOpen] = useState(false);

  // Draft selection inside drawer
  const [draftValue, setDraftValue] = useState<UiOptionValue | null>(
    values.find((v) => v.isActive) || null
  );

  const toggleDrawer = (value: boolean) => () => {
    if (value) {
      setDraftValue(values.find((v) => v.isActive) || null);
    }
    setOpen(value);
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
          onClick={toggleDrawer(true)}
        />

        <OptionGrid columns="auto-fill" minColumnWidth={82} gap="sm">
          {values.map((item) => (
            <Thumbnail
              key={item.id}
              src={item.variant?.cover?.url || ""}
              alt={item.title}
              selected={item.isActive}
              disabled={!item.variant}
              onClick={() => onSelect(item)}
            />
          ))}
        </OptionGrid>
      </Flex>

      <OptionDrawerLayout
        open={open}
        title={title}
        onClose={handleCancel}
        footer={{
          selectedLabel: draftValue?.title || "",
          onConfirm: handleConfirm,
        }}
      >
        <DrawerGrid>
          {values.map((item) => (
            <Thumbnail
              key={item.id}
              src={item.variant?.cover?.url || ""}
              alt={item.title}
              selected={
                draftValue ? draftValue.id === item.id : item.isActive
              }
              disabled={!item.variant}
              onClick={() => setDraftValue(item)}
              overlay={
                <Radio
                  checked={
                    draftValue ? draftValue.id === item.id : item.isActive
                  }
                />
              }
            />
          ))}
        </DrawerGrid>
      </OptionDrawerLayout>
    </>
  );
};
