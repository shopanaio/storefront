import { Button, Flex, Divider } from "antd";
import Link from "next/link";
import { TbMenu2 } from "react-icons/tb";
import { mq } from "@src/components/Theme/breakpoints";
import { FullLogo } from "./Logo";
import { CartButton } from "./CartButton";
import { DesktopSearch } from "../Search/DesktopSearch";
import { useTranslations } from "next-intl";
import { createStyles } from "antd-style";
import { SupportButton } from "./SupportButton";
import { WishlistButton } from "./WishlistButton";
import { AccountButton } from "./AccountButton";
import { AppDrawerButton } from "./AppDrawerButton";

export const Header: React.FC = () => {
  const t = useTranslations("Header");
  const { styles } = useStyles();

  return (
    <div className={styles.header}>
      <div className={styles.container}>
        <AppDrawerButton className={styles.menuBtn} />
        <Flex className={styles.logoWrapper}>
          <Link className={styles.logoLink} href="/">
            <FullLogo theme="light" size={34} />
          </Link>
        </Flex>
        <DesktopSearch />
        <Flex className={styles.headerLinksList}>
          <SupportButton />
          <WishlistButton />
          <AccountButton />
          <CartButton />
        </Flex>
      </div>
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    header: css`
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      padding: ${token.paddingSM}px;
      background-color: ${token.colorBgBase};
      box-shadow: ${token.boxShadowTertiary};
      position: relative;

      ${mq.lg} {
        padding: ${token.paddingSM}px ${token.padding}px;
      }
    `,
    container: css`
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;
      gap: ${token.marginXS}px;

      ${mq.md} {
        column-gap: ${token.margin}px;
      }

      ${mq.xl} {
        margin: 0 auto;
        max-width: 1280px;
      }

      ${mq.xxl} {
        max-width: 1400px;
      }
    `,
    menuBtn: css`
      order: -1;
      height: var(--components-header-control-height);

      ${mq.lg} {
        display: none;
      }
    `,
    logoWrapper: css`
      /* order: 2; */
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
      gap: ${token.marginXXS}px;
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
