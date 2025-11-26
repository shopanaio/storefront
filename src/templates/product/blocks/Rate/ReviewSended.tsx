import { Button, Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import { TbCircleCheckFilled } from "react-icons/tb";
const { Text } = Typography;
interface ReviewSendedProps {
  onClose: () => void;
}

export const ReviewSended = ({ onClose }: ReviewSendedProps) => {
  const t = useTranslations("Product");

  const { styles } = useStyles();

  return (
    <Flex className={styles.successReview} vertical align="center" gap={24}>
      <TbCircleCheckFilled className={styles.successImg} />

      <Flex vertical align="center">
        <Text className={styles.successTitle} strong>
          {t("review-submitted")}
        </Text>

        <Text className={styles.successText}>{t("review-success-text")}</Text>
      </Flex>
      <Button onClick={onClose}>{t("close")}</Button>
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => {
  return {
    successReview: css`
      padding: 76px 0 76px 0;
    `,
    successImg: css`
      font-size: 80px;
      fill: ${token.colorSuccess};
    `,

    successTitle: css`
      font-size: ${token.fontSizeHeading3}px;
    `,
    successText: css`
      text-align-last: center;
      text-decoration-color: ${token.colorTextSecondary};
    `,
  };
});
