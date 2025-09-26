import { Button, Flex, Divider } from "antd";
import Link from "next/link";
import { TbMenu2 } from "react-icons/tb";
import { mq } from "@src/components/Theme/breakpoints";
import { FullLogo } from "./Logo";
import { CartButton } from "./CartButton";
import { DesktopSearch } from "../Search/DesktopSearch";
import { useTranslations } from "next-intl";
import { createStyles, cx } from "antd-style";
import { useEffect, useState } from "react";
import { SupportButton } from "./SupportButton";
import { WishlistButton } from "./WishlistButton";
import { AccountButton } from "./AccountButton";
import { AppDrawerButton } from "./AppDrawerButton";

interface Props {
  visible: boolean;
}

export const StickyHeader: React.FC<Props> = ({ visible }) => {
  const t = useTranslations("Header");
  const { styles } = useStyles();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={cx(styles.header, mounted && visible && styles.visible)}>
      <div className={styles.container}>
        <AppDrawerButton className={styles.menuBtn} size={24} />
        <Flex className={styles.logoWrapper}>
          <Link className={styles.logoLink} href="/">
            <FullLogo theme="light" size={32} />
          </Link>
        </Flex>
        <DesktopSearch />
        <Flex className={styles.headerLinksList}>
          <SupportButton />
          <WishlistButton />
          <AccountButton />
          <CartButton />
        </Flex>
        <div className={styles.breakRow} />
      </div>
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    header: css`
      width: 100%;
      background-color: ${token.colorBgBase};
      box-shadow: ${token.boxShadowTertiary};
      opacity: 0;
      padding: ${token.paddingXS}px ${token.paddingSM}px;
      position: fixed;
      top: 0;
      transform: translateY(-100%);
      transition: transform 0.3s ease, opacity 0.3s ease;
      z-index: 20;

      ${mq.lg} {
        padding: ${token.paddingXS}px ${token.padding}px;
      }
    `,
    container: css`
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;
      gap: ${token.marginXS}px;

      ${mq.xl} {
        margin: 0 auto;
        max-width: 1280px;
      }

      ${mq.xxl} {
        max-width: 1400px;
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
