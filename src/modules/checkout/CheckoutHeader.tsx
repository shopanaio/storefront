import { Layout, Flex } from "antd";
import Link from "next/link";
import { TbPhone } from "react-icons/tb";
import { mq } from "@src/components/Theme/breakpoints";
import { FullLogo } from "@src/components/Layout/Logo";
import { HeaderLinkButton } from "@src/components/Layout/HeaderLinkButton";
import { createStyles } from "antd-style";
const { Header: AntHeader } = Layout;
import { useTranslations } from "next-intl";

export const CheckoutHeader = () => {
  const { styles } = useStyles();
  const t = useTranslations("Header");

  return (
    <>
      <AntHeader className={styles.header}>
        <Flex
          className={styles.container}
          align="center"
          justify="space-between"
        >
          <Flex className={styles.logoWrapper}>
            <Link className={styles.logoLink} href="/">
              <FullLogo theme="light" size={32} />
            </Link>
          </Flex>

          <Flex className={styles.supportWrapper}>
            <HeaderLinkButton
              icon={<TbPhone size={24} />}
              topText={t("customer-support")}
              bottomText="+1 (999) 111-11-11"
              mobileBlock={true}
            />
          </Flex>
        </Flex>
      </AntHeader>
    </>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      width: 100%;

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
      height: 100%;
      padding: ${token.padding}px;
      background-color: ${token.colorBgBase};
    `,

    logoWrapper: css``,

    logoLink: css`
      display: flex;
      align-items: center;
    `,

    supportWrapper: css`
      display: none;
      ${mq.lg} {
        display: flex;
        align-items: center;
      }
    `,
  };
});
