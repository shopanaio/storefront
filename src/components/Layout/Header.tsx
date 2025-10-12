'use client';

import { Flex } from "antd";
import Link from "next/link";
import { mq } from "@src/components/Theme/breakpoints";
import { useLogo } from "@src/hooks/useLogo";
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
  const Logo = useLogo();

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <AppDrawerButton />
        <Link className={styles.logo} href="/">
          <Logo theme="light" size={36} />
        </Link>
        <DesktopSearch />
        <Flex className={styles.actions}>
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
    container: css`
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      padding: ${token.paddingSM}px;
      background-color: ${token.colorBgBase};
      box-shadow: ${token.boxShadowTertiary};
      position: sticky;
      top: 0;
      z-index: 20;

      ${mq.lg} {
        padding: ${token.paddingSM}px ${token.padding}px;
      }
    `,
    inner: css`
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;
      gap: ${token.marginSM}px;

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
    logo: css`
      flex-grow: 1;
      display: flex;
      align-items: center;

      ${mq.lg} {
        flex-grow: unset;
        padding-right: ${token.padding}px;
      }
    `,
    actions: css`
      order: 3;
      justify-content: flex-end;
      align-items: center;
      gap: ${token.marginXXS}px;
      ${mq.lg} {
        order: 4;
        min-width: max-content;
      }
    `,
  };
});
