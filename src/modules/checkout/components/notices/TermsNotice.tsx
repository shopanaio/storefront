import { Button, Flex, Typography } from 'antd';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

interface TermsNoticeProps {
  linkClassName?: string;
}

export const TermsNotice = ({ linkClassName }: TermsNoticeProps) => {
  const t = useTranslations('Checkout');
  return (
    <Flex gap={4} wrap>
      <Text type="secondary">{t('confirm-note')}</Text>
      <Button type="link" className={linkClassName}>
        {t('terms-service')}
      </Button>
      <Text type="secondary">{t('and')}</Text>
      <Button type="link" className={linkClassName}>
        {t('privacy-notice')}
      </Button>
    </Flex>
  );
};
