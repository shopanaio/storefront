'use client';

import { createStyles } from 'antd-style';

import {
  Breadcrumbs,
  BreadcrumbsProps,
} from '@src/components/Layout/Breadcrumbs';
import { Flex } from 'antd';

interface PageLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbsProps;
}

export const PageLayout = ({ children, breadcrumbs }: PageLayoutProps) => {
  const { styles } = useStyles();

  return (
    <div className={styles.mainBg} data-testid="page-layout">
      <Flex vertical className="container">
        <div className={styles.breadcrumbs}>
          {breadcrumbs && <Breadcrumbs {...breadcrumbs} />}
        </div>
        {children}
      </Flex>
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    mainBg: css`
      background: ${token.colorBgContainer};
    `,
    breadcrumbs: css`
      padding-block: ${token.paddingSM}px;
    `,
    container: css``,
  };
});
