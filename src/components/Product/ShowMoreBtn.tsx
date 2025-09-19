"use client";

import { Button } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";

interface Prop {
  full?: boolean;
  onClick?: () => void;
}

export const ShowMoreBtn = ({ full, onClick }: Prop) => {
  const { styles } = useStyles();

  const t = useTranslations("Listing");

  return (
    <Button className={styles.showMoreLessBtn} type="link" onClick={onClick}>
      {full ? t("show-less") : t("show-more")}
    </Button>
  );
};

const useStyles = createStyles(({ css }) => ({
  showMoreLessBtn: css`
    display: flex;
    justify-content: flex-start;
    padding: 0;
  `,
}));
