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
        <AppDrawerButton />
        <Flex className={styles.logoWrapper}>
          <Link className={styles.logoLink} href="/">
            <FullLogo theme="light" size={34} />
          </Link>
        </Flex>
        <DesktopSearch />
        <Flex className={styles.headerActions}>
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
    logoWrapper: css`
      flex-grow: 1;

      ${mq.lg} {
        flex-grow: unset;
        padding-right: ${token.padding}px;
      }
    `,
    logoLink: css`
      display: flex;
      align-items: center;
    `,
    headerActions: css`
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
