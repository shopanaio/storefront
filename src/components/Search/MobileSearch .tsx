"use client";

import React, { useEffect, useRef } from "react";
import { Input } from "antd";
import { TbSearch } from "react-icons/tb";
import type { InputRef } from "antd";
import SearchResults from "./SearchResults";
import { useTranslations } from "next-intl";
import { createStyles } from "antd-style";
import { useSearchInput } from "@src/hooks/useSearchInput";
import { useModalStore } from "@src/store/appStore";
import { DrawerBase } from "@src/components/UI/DrawerBase";

export const MobileSearch: React.FC = () => {
  const t = useTranslations("Header");
  const { styles } = useStyles();
  const inputRef = useRef<InputRef>(null);
  const isOpen = useModalStore((state) => state.searchDialogOpen);
  const setIsOpen = useModalStore((state) => state.setSearchDialogOpen);
  const { searchTerm, setSearchTerm, debouncedTerm } = useSearchInput(300);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else if (!isOpen) {
      // Reset search term when drawer is closed
      setSearchTerm("");
    }
  }, [isOpen, setSearchTerm]);

  return (
    <DrawerBase
      open={isOpen}
      onClose={() => setIsOpen(false)}
      title={t("search")}
      width="var(--components-drawer-width)"
    >
      <div data-testid="mobile-search-drawer">
        <Input
          allowClear
          className={styles.input}
          ref={inputRef}
          placeholder={`${t("search")} ...`}
          prefix={<TbSearch className={styles.searchIcon} size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchResults searchTerm={debouncedTerm} />
      </div>
    </DrawerBase>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    input: css`
      display: flex;
      width: 100%;
      height: 40px;
      padding: ${token.paddingXS}px ${token.paddingSM}px;
      margin-bottom: 0;
    `,
    searchIcon: css`
      color: ${token.colorTextPlaceholder};
    `,
  };
});
