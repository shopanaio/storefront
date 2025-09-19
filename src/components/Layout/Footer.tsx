"use client";

import { useTranslations } from "next-intl";
import { createStyles } from "antd-style";
import { Button, Flex, Input, Typography } from "antd";
import { TbMail } from "react-icons/tb";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mq } from "@src/components/Theme/breakpoints";
import { useLocale } from "next-intl";
import { ApiMenu } from "@codegen/schema-client";
import { useMenuHref } from "@src/hooks/useMenuHref";

const { Text } = Typography;

type Props = {
  menus: ApiMenu[];
};

export const Footer = ({ menus }: Props) => {
  const t = useTranslations("Footer");
  const { styles } = useStyles();
  const pathname = usePathname();
  const locale = useLocale();

  const getHref = useMenuHref(locale);

  return (
    <div className={styles.footer}>
      <div className={styles.container}>
        <Flex gap={32} vertical>
          <div className={styles.footerMain}>
            <Flex className={styles.subscribeBlock} vertical gap={12}>
              <Text className={styles.footerTitle} strong>
                {t("newsletter")}
              </Text>
              <Text>{t("newsletter-paragraph")}</Text>

              <Input
                placeholder={t("email")}
                prefix={<TbMail className={styles.inputIcon} size={16} />}
                size="large"
              />

              <Button
                className={styles.subscribeBtn}
                type="primary"
                size="large"
              >
                {t("subscribe")}
              </Button>
            </Flex>

            {menus.map((menu, idx) => (
              <Flex vertical key={`${menu.id}-${idx}`}>
                <Text strong>{menu.title}</Text>
                {menu.items.edges.map((edge, jdx) => {
                  const node = edge?.node?.node;
                  const isActive = pathname === node?.handle;

                  return (
                    <Link
                      key={`${node?.handle || edge.node.title}-${jdx}`}
                      href={getHref(node)}
                    >
                      <Button
                        className={styles.menuItem}
                        type="text"
                        style={{
                          color: isActive
                            ? "var(--ant-color-primary)"
                            : "var(--ant-color-text)",
                        }}
                      >
                        {edge.node.title}
                      </Button>
                    </Link>
                  );
                })}
              </Flex>
            ))}
          </div>

          <Flex justify="center">
            <Text>© Shopana 2025. All rights reserved.</Text>
          </Flex>
        </Flex>
      </div>
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    footer: css`
      background-color: ${token.colorBgBase};
      padding: ${token.padding}px;
      ${mq.xl} {
        //  padding: ${token.padding}px 0;
      }
    `,
    container: css`
      ${mq.xl} {
        width: 1280px;
        margin-left: auto;
        margin-right: auto;
      }

      ${mq.xxl} {
        width: 1400px;
      }
    `,

    footerTitle: css`
      font-size: ${token.fontSizeHeading5}px;
    `,

    inputIcon: css`
      color: ${token.colorTextPlaceholder};
    `,

    footerMain: css`
      display: flex;
      flex-direction: column;
      gap: ${token.marginXL}px;

      ${mq.md} {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 0;
        row-gap: ${token.marginXL}px;
      }

      ${mq.lg} {
        grid-template-columns: 1fr 1fr 1fr 1fr;
      }
    `,

    subscribeBlock: css`
      ${mq.md} {
        width: 300px;
      }
      ${mq.lg} {
        margin-right: 64px;
      }
    `,

    subscribeBtn: css`
      width: max-content;

      font-size: ${token.fontSizeLG}px;
    `,

    menuItem: css`
      justify-content: flex-start;

      color: ${token.colorTextBase};
      padding: ${token.paddingXS}px 0;
    `,
  };
});
