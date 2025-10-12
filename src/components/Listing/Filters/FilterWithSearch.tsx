import React, { useState, useMemo } from "react";
import { Flex, Checkbox, Button, Input, Typography } from "antd";
import { useTranslations } from "next-intl";
import { createStyles } from "antd-style";

const { Group } = Checkbox;
const { Text } = Typography;

interface option {
  handle: string;
  id: string;
  title: string;
  count: number;
}

interface FilterWithSearchProps {
  options: option[];
  value: string[];
  maxVisibleOptions?: number;
  onChange: (vals: string[]) => void;
}

export const FilterWithSearch: React.FC<FilterWithSearchProps> = ({
  options,
  value,
  maxVisibleOptions = 10,
  onChange,
}) => {
  const t = useTranslations("Listing");
  const { styles } = useStyles();
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(
    () =>
      options.filter((opt) =>
        opt.title.toLowerCase().includes(search.toLowerCase())
      ),
    [options, search]
  );

  const visibleOptions = showAll
    ? filteredOptions
    : filteredOptions.slice(0, maxVisibleOptions);

  return (
    <Flex vertical gap={16}>
      {options.length >= 20 && (
        <Input
          placeholder={`${t("search-placeholder")}` + "..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}
      <Group
        className={styles.checkboxGroup}
        options={visibleOptions.map((opt) => ({
          disabled: opt.count === 0,
          label: (
            <Flex gap={2}>
              {opt.title}
              {opt.count > 0 && <Text type="secondary">({opt.count})</Text>}
            </Flex>
          ),
          value: opt.handle,
        }))}
        value={value}
        onChange={(vals) => onChange(vals as string[])}
      />
      {filteredOptions.length > maxVisibleOptions && (
        <Button
          className={styles.showMoreLessBtn}
          variant="link"
          color="primary"
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
