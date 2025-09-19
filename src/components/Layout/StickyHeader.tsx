import { useModalStore } from "@src/store/appStore";
import { Layout, Button, Flex, Divider } from "antd";
import Link from "next/link";
import {
  TbMenu2,
  TbHeart,
  TbShoppingCart,
  TbUserCircle,
  TbPhone,
} from "react-icons/tb";
import { mq } from "@src/components/Theme/breakpoints";
import { FullLogo } from "./Logo";
import { HeaderLinkButton } from "./HeaderLinkButton";
import { DesktopSearch } from "../Search/DesktopSearch";
import { useLocale, useTranslations } from "next-intl";
import { createStyles, cx } from "antd-style";
import { useEffect, useState } from "react";
import { User } from "domain/User";
import { useRouter } from "next/navigation";
import { Price } from "@src/components/UI/Price/Price";
import { ApiMoney } from "@codegen/schema-client";
const { Header: AntHeader } = Layout;

interface Props {
  onOpenDrawer: () => void;
  onOpenCartDrawer: () => void;
  visible: boolean;
  user: User | null | undefined;
  cartAmount: ApiMoney | null;
  cartLines: number;
}

export const StickyHeader: React.FC<Props> = ({
  onOpenDrawer,
  onOpenCartDrawer,
  visible,
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <AntHeader
      className={cx(styles.header, mounted && visible && styles.visible)}
    >
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
          />
          <HeaderLinkButton
            icon={<TbUserCircle size={24} />}
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
            icon={<TbShoppingCart size={24} />}
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
      </div>
    </AntHeader>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;

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
      position: sticky;
      top: 0;
      z-index: 20; // make a token

      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: ${token.padding}px;
      padding: ${token.paddingSM}px ${token.padding}px;
      background-color: ${token.colorBgBase};
      height: 100%;
      transition: transform 0.3s ease, opacity 0.3s ease;
      transform: translateY(-100%);
      opacity: 0;
      box-shadow: ${token.boxShadowTertiary}; // todo: Use proper token

      margin-top: -78px;

      ${mq.sm} {
        margin-top: -140px;
      }

      ${mq.lg} {
        margin-top: -78px;
      }
    `,
    visible: css`
      transform: translateY(0);
      opacity: 1;
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

    supportWrapper: css`
      display: none;
      ${mq.xl} {
        display: flex;
        align-items: center;
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
  };
});
