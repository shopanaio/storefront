"use client";

import { useTranslations } from "next-intl";
import { createStyles } from "antd-style";
import { Button, Flex, Input, Typography } from "antd";
import { TbMail } from "react-icons/tb";

const { Text } = Typography;

/**
 * Newsletter subscription component for the footer
 */
export const NewsletterSubscribe = () => {
  const t = useTranslations("Footer");
  const { styles } = useStyles();

  return (
    <Flex className={styles.container} vertical gap={12}>
      <Text strong>{t("newsletter")}</Text>
      <Text className={styles.paragraph}>{t("newsletter-paragraph")}</Text>
      <Input
        placeholder={t("email")}
        prefix={<TbMail className={styles.inputIcon} size={16} />}
        size="large"
      />
      <Button className={styles.button} type="primary" size="large">
        {t("subscribe")}
      </Button>
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      padding-right: ${token.paddingXL}px;
      max-width: 400px;
    `,
    inputIcon: css`
      color: ${token.colorTextPlaceholder};
    `,
    paragraph: css`
      display: block;
      max-width: 300px;
    `,
    button: css`
      width: fit-content;
    `,
  };
});
