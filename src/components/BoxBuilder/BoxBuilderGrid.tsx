"use client";

import { createStyles } from "antd-style";
export default function BoxBuilderGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  const { styles } = useStyles();

  return <div className={styles.productList}>{children}</div>;
}

const useStyles = createStyles(({ token, css }) => {
  return {
    productList: css`
      display: grid;
      width: 100%;
      grid-template-columns: repeat(auto-fill, minmax(105px, 1fr));
      align-items: stretch;
      gap: ${token.marginSM}px;
    `,
  };
});
