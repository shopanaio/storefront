import { Flex, Typography, Button } from "antd";
import { useTranslations } from "next-intl";
import { createStyles } from "antd-style";

const { Text } = Typography;

export const AdditionalInfo = () => {
  const t = useTranslations("Product");
  const { styles } = useStyles();

  return (
    <Flex vertical>
      <Text>
        {t("included")}:
        <Button
          className={styles.additionLink}
          variant="link"
          color="default"
          // href="https://www.google.com"
        >
          VAT
        </Button>
      </Text>
      <Text>
        {t("not-included")}:
        <Button
          className={styles.additionLink}
          variant="link"
          color="default"
          // href="https://www.google.com"
        >
          {t("shipping-packaging")}
        </Button>
      </Text>
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  additionLink: css`
    text-decoration: underline;
  `,
}));
