import { Button, Input } from "antd";
import { TbSearch } from "react-icons/tb";
import { createStyles } from "antd-style";
import { useLocale, useTranslations } from "next-intl";
import React from "react";
import { mq } from "@src/components/Theme/breakpoints";
import { useModalStore } from "@src/store/appStore";

type DesktopSearchInputProps = {
  onClick?: () => void;
};

export const DesktopSearchInput: React.FC<DesktopSearchInputProps> = ({
  onClick,
}) => {
  const locale = useLocale();
  const t = useTranslations("Header");
  const { styles } = useStyles();
  const searchTerm = useModalStore((state) => state.searchTerm);
  const setSearchTerm = useModalStore((state) => state.setSearchTerm);

  return (
    <Input
      allowClear
      className={styles.searchInput}
      placeholder={`${t("search")} ...`}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      prefix={<TbSearch className={styles.searchIcon} size={18} />}
      onClick={onClick}
      suffix={
        <Button
          href={`${locale}/search?q=${encodeURIComponent(searchTerm)}`}
          type="primary"
          className={styles.searchButton}
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
    searchButton: css`
      ${mq.max.lg} {
        display: none;
      }
    `,
  };
});

export default DesktopSearchInput;
