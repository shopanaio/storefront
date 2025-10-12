import { Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';

const { Text, Title } = Typography;

interface Props {
  subtitle?: string;
  stepNumber?: 1 | 2 | 3;
  title: string;
  description?: string;
}

export const StepHeader = ({
  subtitle,
  stepNumber,
  title,
  description,
}: Props) => {
  const { styles } = useStyles();
  const t = useTranslations('BoxBuilder');

  return (
    <Flex vertical>
      <Text className={styles.subtitle}>
        {subtitle}
        {stepNumber &&
          `${t('step-of-steps', {
            step: stepNumber,
            total: 3,
          })}`}
      </Text>
      <Title
        className={styles.title}
        level={3}
        style={{
          marginTop: -2,
          ...(description
            ? {
                marginBottom: 0,
              }
            : {}),
        }}
      >
        {title}
      </Title>
      {description && <Text className={styles.description}>{description}</Text>}
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    subtitle: css`
      font-size: ${token.fontSizeSM}px;
      color: ${token.colorTextSecondary};
    `,

    description: css`
      font-size: ${token.fontSize}px;
      color: ${token.colorTextSecondary};
    `,
  };
});
