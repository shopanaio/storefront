"use client";

import { Button, Typography, MenuProps, message, Flex } from "antd";
import { DropdownButton } from "./DropdownButton";
import { mq } from "@src/ui-kit/Theme/breakpoints";
import { useTranslations } from "next-intl";
import { createStyles } from "antd-style";
import { useCurrencyStore } from "@src/store/appStore";
import { CurrencyCode } from "@codegen/schema-client";
import React from "react";

const { Text } = Typography;

const languageItems: MenuProps["items"] = [
  { label: "English (EN)", key: "EN" },
  { label: "Ukrainian (UK)", key: "UK" },
  { label: "Russian (RU)", key: "RU" },
];

const currencyLabels: Record<CurrencyCode, string> = {
  [CurrencyCode.Uah]: "Hryvnia (UAH ₴)",
  [CurrencyCode.Usd]: "Dollar (USD $)",
  [CurrencyCode.Eur]: "Euro (EUR €)",
};

const currencyItems: MenuProps["items"] = [
  { label: currencyLabels[CurrencyCode.Uah], key: CurrencyCode.Uah },
  { label: currencyLabels[CurrencyCode.Usd], key: CurrencyCode.Usd },
  { label: currencyLabels[CurrencyCode.Eur], key: CurrencyCode.Eur },
];

export const AnnouncementBar = () => {
  const t = useTranslations("Header");
  const { styles } = useStyles();

  const currencyCode = useCurrencyStore((state) => state.currencyCode);
  const setCurrencyCode = useCurrencyStore((state) => state.setCurrencyCode);

  const selectedCurrencyLabel = (() => {
    const fullLabel = currencyLabels[currencyCode];
    const match = fullLabel.match(/\(([^)]+)\)/);
    return match ? match[1] : fullLabel;
  })();

  const handleCurrencyClick: MenuProps["onClick"] = (e) => {
    setCurrencyCode(e.key as CurrencyCode);
    message.success(
      `Currency changed to: ${currencyLabels[e.key as CurrencyCode]}`
    );
  };

  const [selectedLanguage, setSelectedLanguage] = React.useState("EN");
  const handleLanguageClick: MenuProps["onClick"] = (e) => {
    setSelectedLanguage(e.key);
    message.success(`Language changed to: ${e.key}`);
  };

  return (
    <div className={styles.blackLine}>
      <div className={styles.container}>
        <Flex className={styles.content} justify="space-between" align="center">
          <div className={styles.nav}>
            <Button type="text" className={styles.navItem}>
              <Text className={styles.navText}>{t("marketplace")}</Text>
            </Button>
            <Button type="text" className={styles.navItem}>
              <Text className={styles.navText}>{t("accessories")}</Text>
            </Button>
            <Button type="text" className={styles.navItem}>
              <Text className={styles.navText}>{t("blog")}</Text>
            </Button>
          </div>

          <div className={styles.dropdownList}>
            <DropdownButton
              label={selectedLanguage}
              items={languageItems}
              onClick={handleLanguageClick}
              ButtonComponent={(props) => (
                <Button {...props} className={styles.dropdownBtn} />
              )}
            />
            <DropdownButton
              label={selectedCurrencyLabel}
              items={currencyItems}
              onClick={handleCurrencyClick}
              ButtonComponent={(props) => (
                <Button {...props} className={styles.dropdownBtn} />
              )}
            />
          </div>
        </Flex>
      </div>
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  blackLine: css`
    height: 32px;
    display: none;
    ${mq.lg} {
      display: block;
      background-color: var(--always-black-bg);
    }
  `,
  container: css`
    width: 100%;

    ${mq.xl} {
      margin: 0 auto;
      max-width: 1280px;
    }

    ${mq.xxl} {
      max-width: 1400px;
    }
  `,
  content: css``,
  nav: css`
    display: flex;
    gap: ${token.marginXS}px;
  `,
  navItem: css`
    padding: ${token.paddingXS}px;
  `,
  navText: css`
    font-size: ${token.fontSize}px;
    color: ${token.colorTextLightSolid};
  `,
  dropdownList: css`
    display: flex;
    gap: ${token.marginXS}px;
  `,
  dropdownBtn: css`
    color: ${token.colorTextLightSolid};
    background-color: transparent;
    border: none;
    box-shadow: none;
    padding: ${token.paddingXS}px;

    :hover {
      background-color: transparent !important;
    }
  `,
}));
