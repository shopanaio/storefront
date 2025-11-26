"use client";

import { Flex, Typography } from "antd";
import { createStyles, cx } from "antd-style";
import { mq } from "@src/ui-kit/Theme/breakpoints";
import { TbChevronRight } from "react-icons/tb";
import { OptionDrawerLayout } from "./DrawerLayout";
import { useMemo, useState } from "react";
import { UiOptionValue } from "@src/hooks/useFlattenProductOptions";
import Wave from "antd/es/_util/wave";
import { OptionRadioButton } from "./OptionRadioButton";
import { DrawerGrid } from "./DrawerGrid";

const { Text } = Typography;

interface Props {
  title: string;
  values: UiOptionValue[];
  onSelect: (value: UiOptionValue) => void;
}

export const SelectOption = ({ title, values, onSelect }: Props) => {
  const { styles } = useStyles();

  const [open, setOpen] = useState(false);

  /* Committed selection that is displayed on the page */
  const [committedValue, setCommittedValue] = useState<UiOptionValue | null>(
    values.find((v) => v.isActive) || null
  );

  /* Draft selection inside the drawer */
  const [draftValue, setDraftValue] = useState<UiOptionValue | null>(
    committedValue
  );

  const showDrawer = () => {
    setDraftValue(committedValue);
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);

    if (draftValue) {
      setCommittedValue(draftValue);
      onSelect(draftValue);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const selectedTitle = useMemo(
    () => committedValue?.title || "",
    [committedValue]
  );

  return (
    <>
      <Wave>
        <Flex
          className={cx(
            styles.container,
            "ant-btn",
            "ant-btn-default",
            "ant-btn-variant-outlined"
          )}
          role="button"
          onClick={showDrawer}
          justify="space-between"
          align="center"
          gap={16}
        >
          <Flex vertical align="start">
            <Text>{title}</Text>
            <Text strong>{selectedTitle}</Text>
          </Flex>
          <TbChevronRight size={20} />
        </Flex>
      </Wave>

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
    padding: ${token.padding}px;
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorBorder};
    height: unset;
  `,

  optionDrawerTitle: css`
    font-size: ${token.fontSize}px;
    font-weight: 600;
    ${mq.lg} {
      font-size: ${token.fontSizeLG}px;
    }
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
  /* radio button style moved to OptionRadioButton component */
  variantsGrid: css`
    display: grid;
    grid-template-columns: repeat(
      auto-fill,
      minmax(var(--thumb-size, 10px), 1fr)
    );
    gap: ${token.marginSM}px;
  `,
}));
