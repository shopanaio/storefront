import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

export const TermsNotice = () => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  return (
    <div>
      <Text type="secondary">{t('confirm-note')}</Text>
      {':'}
      <ul className={styles.list}>
        <li className={styles.listItem}>
          <Button
            color="default"
            variant="link"
            href="#"
            className={styles.link}
          >
            {t('user-agreement')}
          </Button>
        </li>
        <li className={styles.listItem}>
          <Button
            color="default"
            variant="link"
            href="#"
            className={styles.link}
          >
            {t('privacy-policy')}
          </Button>
        </li>
      </ul>
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  list: css`
    display: flex;
    flex-direction: column;
    align-items: start;
    padding-inline: ${token.padding}px;
    margin: 0;
  `,
  listItem: css`
    margin: 0;
  `,
  link: css`
    padding: 0;
    height: 0px;
  `,
}));
