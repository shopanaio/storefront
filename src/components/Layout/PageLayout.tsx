"use client";

import { createStyles } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";

import {
  Breadcrumbs,
  BreadcrumbsProps,
} from "@src/components/Layout/Breadcrumbs";

interface PageLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbsProps;
}

export const PageLayout = ({ children, breadcrumbs }: PageLayoutProps) => {
  const { styles } = useStyles();

  return (
    <div className={styles.mainBg} data-testid="page-layout">
      <div className={styles.container}>
        {breadcrumbs && <Breadcrumbs {...breadcrumbs} />}
        {children}
      </div>
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    mainBg: css`
      background: ${token.colorBgContainer};
    `,
    container: css`
      display: flex;
      flex-direction: column;
      padding: ${token.padding}px;

      width: 100%;
      ${mq.xl} {
        padding: ${token.padding}px 0;
        margin-right: auto;
        margin-left: auto;
        max-width: 1280px;
      }

      ${mq.xxl} {
        max-width: 1400px;
      }
    `,
  };
});
