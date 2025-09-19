import React, { useState } from "react";
import { Flex, Checkbox, Button } from "antd";
import { useTranslations } from "next-intl";
import { createStyles } from "antd-style";

const CheckboxGroup = Checkbox.Group;

interface option {
  handle: string;
  id: string;
  title: string;
}

interface FilterCheckboxProps {
  options: option[];
  onChange: (checked: string[]) => void;
  maxVisibleOptions?: number;
  /* multiply?: boolean; */
}

export const FilterCheckbox: React.FC<FilterCheckboxProps> = ({
  options,
  maxVisibleOptions = 4,
  /* multiply = true, */
}) => {
  const t = useTranslations("Listing");
  const { styles } = useStyles();
  const [showAll, setShowAll] = useState(false);

  const visibleOptions = showAll
    ? options
    : options.slice(0, maxVisibleOptions);

  return (
    <Flex vertical gap={16}>
      <CheckboxGroup
        className={styles.checkboxGroup}
        options={visibleOptions.map((opt) => ({
          label: opt.title,
          value: opt.title,
        }))}
        onChange={()=>{}}
      />
      {options.length > maxVisibleOptions && (
        <Button
          className={styles.showMoreLessBtn}
          type="link"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? t("show-less") : t("show-more")}
        </Button>
      )}
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  showMoreLessBtn: css`
    display: flex;
    justify-content: flex-start;
  `,
  checkboxGroup: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXS}px;
  `,
}));