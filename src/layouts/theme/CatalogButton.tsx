import { Button } from "antd";
import { ReactNode } from "react";
import { createStyles } from "antd-style";

import { mq } from "@src/ui-kit/Theme/breakpoints";
import { TbLayoutGridFilled } from "react-icons/tb";
import { useTranslations } from "next-intl";

type Props = {
  icon?: ReactNode;
  text?: string;
  onClick?: () => void;
};

export const CatalogBtn = ({ onClick }: Props) => {
  const { styles } = useStyles();
  const t = useTranslations("Header");

  return (
    <Button
      className={styles.catalogBtn}
      type="primary"
      icon={<TbLayoutGridFilled size={24} />}
      onClick={onClick}
      size="large"
    >
      {t("catalog")}
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
