import { Button, Input } from "antd";
import { TbSearch } from "react-icons/tb";
import { createStyles } from "antd-style";
import { useLocale, useTranslations } from "next-intl";
import React from "react";

type DesktopSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
};

export const DesktopSearchInput: React.FC<DesktopSearchInputProps> = ({
  value,
  onChange,
  onFocus,
}) => {
  const locale = useLocale();
  const t = useTranslations("Header");
  const { styles } = useStyles();

  return (
    <Input
      allowClear
      className={styles.searchInput}
      placeholder={`${t("search")} ...`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      prefix={<TbSearch className={styles.searchIcon} size={18} />}
      onFocus={onFocus}
      suffix={
        <Button
          href={`${locale}/search?q=${encodeURIComponent(value)}`}
          type="primary"
        >
          {t("search")}
        </Button>
      }
    />
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    searchInput: css`
      width: 100%;
      background-color: transparent;
      padding-right: ${token.paddingXXS}px;
    `,
    searchIcon: css`
      color: ${token.colorTextPlaceholder};
    `,
  };
});

export default DesktopSearchInput;
