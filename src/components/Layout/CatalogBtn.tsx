import { Button } from "antd";
import { ReactNode } from "react";
import { createStyles } from "antd-style";

import { mq } from "@src/components/Theme/breakpoints";

type Props = {
  icon?: ReactNode;
  text?: string;
  onClick?: () => void;
};

export const CatalogBtn = ({ icon, text, onClick }: Props) => {
  const { styles } = useStyles();

  return (
    <Button
      className={styles.catalogBtn}
      type="primary"
      icon={icon}
      onClick={onClick}
      size="large"
    >
      {text}
    </Button>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    catalogBtn: css`
      font-weight: var(--font-weight-500);
      font-size: ${token.fontSize}px;

      ${mq.max.sm} {
        width: 100%;
      }

      ${mq.sm} {
        font-size: ${token.fontSizeLG}px;
        /* height: var(--components-header-control-height); */
      }
    `,
  };
});
