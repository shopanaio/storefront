"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModalStore } from "@src/store/appStore";
import { Drawer, Divider, Flex, Button, Typography, Badge } from "antd";
import { FullLogo } from "./Logo";
import {
  TbHeart,
  TbLayoutGridFilled,
  TbPhoneFilled,
  TbShoppingCart,
  TbUserCircle,
} from "react-icons/tb";
import { RxCross2 } from "react-icons/rx";
import { LanguageDropdown } from "./LanguageDropdown";
import { CurrencyDropdown } from "./CurrencyDropdown";
import { HeaderLinkButton } from "./HeaderLinkButton";
import { useTranslations } from "next-intl";
import { createStyles } from "antd-style";

const { Text } = Typography;

interface DrawerComponentProps {
  open: boolean;
  onClose: () => void;
}

export const DrawerComponent: React.FC<DrawerComponentProps> = ({
  open,
  onClose,
}) => {
  const setIsAuthModalVisible = useModalStore(
    (state) => state.setIsAuthModalVisible
  );
  const pathname = usePathname();
  const t = useTranslations("Header");
  const { styles } = useStyles();

  const menuLinks = [
    { label: "Link item 1", path: "/item1" },
    { label: "Link item 2", path: "/item2" },
    { label: "Link item 3", path: "/item3" },
    { label: "Link item 4", path: "/item4" },
    { label: "Link item 5", path: "/item5" },
  ];

  return (
    <Drawer
      placement="left"
      onClose={onClose}
      open={open}
      closable={false}
      drawerRender={() => (
        <div className={`${styles.customDrawer} ant-drawer-content`}>
          <Flex className={styles.drawerHeader} vertical>
            <Flex align="center" justify="space-between">
              <FullLogo theme="dark" size={32} />
              <Button
                icon={<RxCross2 size={24} />}
                type="text"
                className={styles.closeBtn}
                onClick={onClose}
              />
            </Flex>

            <Flex>
              <HeaderLinkButton
                icon={
                  <TbPhoneFilled size={24} className={styles.supportIcon} />
                }
                topText={t("customer-support")}
                bottomText="+1 (999) 111-11-11"
                theme="dark"
                mobileBlock={false}
              />
            </Flex>
          </Flex>

          <div>
            <Button
              type="primary"
              icon={<TbLayoutGridFilled size={24} />}
              className={styles.catalogBtn}
            >
              {t("catalog")}
            </Button>

            <Flex className={styles.linksBtnsList} vertical>
              <Button
                type="text"
                icon={<TbShoppingCart size={20} />}
                className={styles.linkBtn}
              >
                {t("cart")}
                <Badge count={4} color="blue" className={styles.badge} />
              </Button>

              <Button
                type="text"
                icon={<TbHeart size={20} />}
                className={styles.linkBtn}
              >
                {t("wishlist")}
                <Badge count={100} color="default" className={styles.badge} />
              </Button>

              <Button
                type="text"
                icon={<TbUserCircle size={20} />}
                className={styles.linkBtn}
                onClick={() => setIsAuthModalVisible(true)}
              >
                {t("account")}
              </Button>
            </Flex>

            <Divider className={styles.divider} />

            <Flex className={styles.menuSection} vertical>
              <Text type="secondary" className={styles.menuListTitle}>
                {t("menu-title")}
              </Text>

              {menuLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link key={link.path} href={link.path}>
                    <Button
                      type="text"
                      className={styles.menuItem}
                      style={{
                        color: isActive
                          ? "var(--ant-color-primary)"
                          : "var(--ant-color-text)",
                      }}
                    >
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
            </Flex>

            <Divider className={styles.divider} />

            <Flex className={styles.dropdownList} vertical align="start">
              <LanguageDropdown />
              <CurrencyDropdown />
            </Flex>
          </div>
        </div>
      )}
    />
  );
};

const useStyles = createStyles(({ css, token }) => ({
  customDrawer: css`
    padding: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${token.colorBgBase};
  `,
  drawerHeader: css`
    width: 100%;
    padding: ${token.paddingMD}px;
    background-color: var(--always-black-bg);
    gap: ${token.marginMD}px;
  `,

  closeBtn: css`
    color: ${token.colorTextLightSolid};
    &:hover {
      color: ${token.colorPrimary} !important;
    }
  `,
  supportIcon: css`
    color: ${token.colorPrimary};
  `,
  catalogBtn: css`
    justify-content: flex-start;
    width: 100%;
    height: 46px;
    padding: ${token.paddingSM}px ${token.paddingMD}px;
    border-radius: 0;
    margin-bottom: ${token.marginXS}px;
  `,
  linksBtnsList: css`
    width: 100%;
    padding-bottom: ${token.paddingLG}px;
  `,
  linkBtn: css`
    display: flex;
    justify-content: flex-start;
    width: 100%;
    font-size: ${token.fontSizeLG}px;
    color: ${token.colorTextBase};
    padding: ${token.marginXS}px ${token.paddingMD}px;

    &:hover {
      color: ${token.colorPrimary} !important;
    }
  `,
  badge: css`
    margin-left: auto;
  `,

  menuSection: css`
    padding-top: ${token.padding}px;
    padding-bottom: ${token.paddingLG}px;
  `,
  menuListTitle: css`
    font-weight: ${token.fontWeightStrong};
    font-size: 12px;
    padding: 0 ${token.paddingMD}px;
    margin-bottom: ${token.marginXXS}px;
  `,
  menuItem: css`
    justify-content: flex-start;
    font-weight: var(--font-weight-400);
    font-size: 14px;

    color: ${token.colorTextBase};
    padding: ${token.paddingXS}px ${token.paddingMD}px;
    width: 100%;
    &:hover {
      color: ${token.colorPrimary} !important;
    }
  `,

  dropdownList: css`
    padding-top: ${token.paddingLG}px;
    padding-right: ${token.paddingMD}px;
    padding-left: ${token.paddingSM}px;
  `,

  divider: css`
    background-color: ${token.colorFillSecondary} !important;
    margin: 0;
  `,
}));
