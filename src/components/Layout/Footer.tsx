"use client";

import { useTranslations } from "next-intl";
import { createStyles } from "antd-style";
import { Button, Flex, Typography } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mq } from "@src/components/Theme/breakpoints";
import { useLocale } from "next-intl";
import { ApiMenu } from "@codegen/schema-client";
import { useMenuHref } from "@src/hooks/useMenuHref";
import { footerMenusArr } from "@src/mocks/footerMenusArr";
import { NewsletterSubscribe } from "./NewsletterSubscribe";

const { Text } = Typography;

type Props = {
  menus?: ApiMenu[];
};

export const Footer = ({ menus = footerMenusArr }: Props) => {
  const t = useTranslations("Footer");
  const { styles } = useStyles();
  const pathname = usePathname();
  const locale = useLocale();

  const getHref = useMenuHref(locale);

  return (
    <div>
      <div className="container">
        <Flex gap={32} vertical>
          <div className={styles.footerMain}>
            <NewsletterSubscribe />

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
        </Flex>
      </div>
      <Flex justify="center" className={styles.footerCopyright}>
        <Text>© Shopana 2025. All rights reserved.</Text>
      </Flex>
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    footerMain: css`
      display: grid;
      padding-top: ${token.padding}px;
      padding-bottom: 100px;
      gap: ${token.marginXL}px;
      grid-template-columns: 1fr 1fr;

      ${mq.lg} {
        grid-template-columns: 1.5fr 1fr 1fr 1fr;
      }

      & :first-child {
        grid-column: 1 / 3;

        ${mq.lg} {
          grid-column: unset;
        }
      }
    `,
    menuItem: css`
      justify-content: flex-start;
      color: ${token.colorTextBase};
      padding: ${token.paddingXS}px 0;
    `,
    footerCopyright: css`
      /* background-color: ${token.colorBgLayout}; */
      padding: ${token.padding}px 0;
    `,
  };
});
