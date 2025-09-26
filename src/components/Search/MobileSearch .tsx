"use client";

import React, { useEffect, useRef } from "react";
import { Drawer, Flex, Button, Typography, Input, Spin } from "antd";
import { RxCross2 } from "react-icons/rx";
import { TbSearch } from "react-icons/tb";
import type { InputRef } from "antd";
import SearchResults from "./SearchResults";
import { useTranslations } from "next-intl";
import { createStyles } from "antd-style";
import { useSearchInput } from "@src/hooks/useSearchInput";
import { useModalStore } from "@src/store/appStore";

const { Text } = Typography;

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
    }
  }, [isOpen]);

  return (
    <Drawer
      placement="right"
      onClose={() => setIsOpen(false)}
      open={isOpen}
      closable={false}
      width="100vw"
      drawerRender={() => (
        <div
          data-testid="mobile-search-drawer"
          className={`${styles.container} ant-drawer-content`}
        >
          <Flex className={styles.header} vertical>
            <Flex align="center" justify="space-between">
              <Text className={styles.title}>{t("search")}</Text>
              <Button
                className={styles.closeButton}
                icon={<RxCross2 size={24} />}
                type="text"
                onClick={() => setIsOpen(false)}
              />
            </Flex>
          </Flex>
          <div className={styles.content}>
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
        </div>
      )}
    />
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      max-height: 100vh;
      padding: 0;
    `,
    header: css`
      width: 100%;
      padding: ${token.padding}px;
    `,
    content: css`
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: ${token.margin}px;
      padding: ${token.padding}px;
    `,
    closeButton: css`
      color: ${token.colorText};
    `,
    title: css`
      font-size: ${token.fontSizeXL}px;
      font-weight: ${token.fontWeightStrong};
      margin: 0;
    `,
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
