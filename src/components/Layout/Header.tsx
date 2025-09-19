import { useModalStore } from "@src/store/appStore";
import { useSessionStore } from "@src/providers/session-store-provider";
// import type { MenuProps } from "antd";
import { Layout, Button, Flex, Divider /* , message */ } from "antd";
import Link from "next/link";
import {
  TbMenu2,
  TbLayoutGridFilled,
  TbHeart,
  TbShoppingCart,
  TbUserCircle,
  TbSearch,
  TbPhone,
  TbUser,
} from "react-icons/tb";
import { mq } from "@src/components/Theme/breakpoints";
import { CatalogBtn } from "./CatalogBtn";
import { FullLogo } from "./Logo";
import { AnnouncementBar } from "./AnnouncementBar";
import { HeaderLinkButton } from "./HeaderLinkButton";
import { DesktopSearch } from "../Search/DesktopSearch";
import { useLocale, useTranslations } from "next-intl";
import { createStyles } from "antd-style";
import { useRouter } from "next/navigation";
import { User } from "@src/store/sessionStore";
import useSignOut from "@src/hooks/auth/useSignOut";
import accessTokenUtils from "@src/utils/accessToken";
import { Price } from "@src/components/UI/Price/Price";
import { ApiMoney } from "@codegen/schema-client";
const { Header: AntHeader } = Layout;

/* const handleLanguageClick: MenuProps["onClick"] = () => {
  message.info("Click on menu item.");
};

const languages: MenuProps["items"] = [
  { label: "Electronics 1", key: "1" },
  { label: "Electronics 2", key: "2" },
  { label: "Electronics 3", key: "3" },
]; */

interface HeaderProps {
  onOpenDrawer: () => void;
  onOpenMobileSearchDrawer: () => void;
  onOpenCartDrawer: () => void;
  user: User | null | undefined;
  cartAmount: ApiMoney | null;
  cartLines: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDrawer,
  onOpenMobileSearchDrawer,
  onOpenCartDrawer,
  user,
  cartAmount,
  cartLines,
}) => {
  const setIsAuthModalVisible = useModalStore(
    (state) => state.setIsAuthModalVisible
  );
  const t = useTranslations("Header");
  const { styles } = useStyles();
  const router = useRouter();
  const locale = useLocale();
  const setSession = useSessionStore((state) => state.setSession);
  const [commit] = useSignOut();

  return (
    <>
      <AnnouncementBar />
      <AntHeader className={styles.header}>
        <div className={styles.container}>
          <Button
            className={styles.menuBtn}
            type="text"
            icon={<TbMenu2 size={24} />}
            onClick={onOpenDrawer}
          />
          <Flex className={styles.logoWrapper}>
            <Link className={styles.logoLink} href="/">
              <FullLogo theme="light" size={32} />
            </Link>
          </Flex>
          <DesktopSearch />
          <Flex className={styles.headerLinksList}>
            <Flex className={styles.supportWrapper}>
              <HeaderLinkButton
                icon={<TbPhone size={24} />}
                topText={t("customer-support")}
                bottomText="+1 (999) 111-11-11"
                mobileBlock={true}
              />
              <Divider
                type="vertical"
                orientation="end"
                style={{ height: "33px" }}
              />
            </Flex>
            <HeaderLinkButton
              icon={<TbHeart size={24} />}
              topText={t("my-items")}
              bottomText={t("wishlist")}
              mobileBlock={true}
              onClick={async () => {
                if (user) {
                  await commit({
                    variables: {
                      input: {},
                    },
                  });
                  setSession(null);
                  accessTokenUtils.removeAccessTokenCookie();
                }
              }}
            />
            <HeaderLinkButton
              icon={user ? <TbUserCircle size={24} /> : <TbUser size={24} />}
              topText={user ? user.email : t("sign-in")}
              bottomText={t("account")}
              onClick={() =>
                user
                  ? router.push(`/${locale}/profile/general`)
                  : setIsAuthModalVisible(true)
              }
              mobileBlock={true}
            />
            <HeaderLinkButton
              icon={<TbShoppingCart size={24} color="currentColor" />}
              topText={t("cart")}
              bottomText={
                cartAmount ? <Price money={cartAmount} raw /> : t("cart")
              }
              badgeCount={cartLines}
              mobileBlock={true}
              onClick={() => onOpenCartDrawer()}
            />
          </Flex>
          <div className={styles.breakRow} />
          <Flex className={styles.catalogWrapper}>
            <CatalogBtn
              icon={<TbLayoutGridFilled size={24} />}
              text={t("catalog")}
            />
            <Button
              className={styles.mobileSearchBtn}
              size="large"
              type="default"
              icon={<TbSearch size={18} />}
              onClick={onOpenMobileSearchDrawer}
            >
              {t("search")}
            </Button>
            <Flex className={styles.bottomNavRight} align="center" gap={16}>
              <Button
                className={styles.navTextButton}
                variant="link"
                color="default"
              >
                {t("marketplace")}
              </Button>
              <Button
                className={styles.navTextButton}
                variant="link"
                color="default"
              >
                {t("electronics")}
              </Button>
              <Button
                className={styles.navTextButton}
                variant="link"
                color="default"
              >
                {t("accessories")}
              </Button>
              <Button
                className={styles.navTextButton}
                variant="link"
                color="default"
              >
                {t("blog")}
              </Button>
              <Button
                className={styles.navTextButton}
                variant="link"
                color="default"
              >
                {t("features")}
              </Button>
            </Flex>
          </Flex>
        </div>
      </AntHeader>
    </>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;
      row-gap: ${token.margin}px;

      ${mq.sm} {
        gap: 0;
        row-gap: ${token.marginXS}px;
      }

      ${mq.md} {
        gap: ${token.margin}px;
        row-gap: ${token.marginXS}px;
      }

      ${mq.lg} {
        gap: ${token.margin}px;
      }

      ${mq.xl} {
        margin-right: auto;
        margin-left: auto;

        max-width: 1280px;
      }

      ${mq.xxl} {
        max-width: 1400px;
      }
    `,
    header: css`
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: ${token.padding}px;
      height: 100%;
      padding: ${token.paddingSM}px ${token.padding}px;
      background-color: ${token.colorBgBase};
      box-shadow: ${token.boxShadowTertiary}; // todo: Use proper token
      position: relative;
      z-index: 10; // make a token
    `,
    menuBtn: css`
      order: 1;
      height: var(--components-header-control-height);

      ${mq.lg} {
        min-width: var(--components-header-control-height);
      }
    `,
    logoWrapper: css`
      order: 2;
      flex-basis: 0;
      ${mq.max.lg} {
        flex-grow: 1;
      }
    `,
    logoLink: css`
      display: flex;
      align-items: center;
    `,
    headerLinksList: css`
      order: 3;
      justify-content: flex-end;
      align-items: center;
      ${mq.lg} {
        order: 4;
        min-width: max-content;
      }
    `,
    breakRow: css`
      display: none;
      flex-basis: 100%;
      height: 0;
      order: 4;
      ${mq.sm} {
        display: block;
      }
      ${mq.lg} {
        display: none;
      }
    `,
    supportWrapper: css`
      display: none;
      ${mq.xl} {
        display: flex;
        align-items: center;
      }
    `,
    catalogWrapper: css`
      order: 5;
      display: flex;
      gap: ${token.padding}px;
      width: 100%;

      ${mq.sm} {
        width: max-content;
      }
      ${mq.md} {
      }
      ${mq.lg} {
        width: 100%;
      }
    `,
    mobileSearchBtn: css`
      display: none;
      ${mq.max.sm} {
        display: flex;
        font-weight: var(--font-weight-500);
        font-size: ${token.fontSize}px;
        width: 100%;
      }
    `,
    bottomNavRight: css`
      display: none;
      ${mq.lg} {
        display: flex;
      }
    `,
    navTextButton: css`
      font-weight: var(--font-weight-500);
      font-size: ${token.fontSizeLG}px;
      color: ${token.colorText};
      padding: 0 ${token.paddingXS}px;
    `,
  };
});
