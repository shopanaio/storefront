import { mq } from '@src/components/Theme/breakpoints';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';

interface Prop {
  children: React.ReactNode;
}

export const SectionTitle = ({ children }: Prop) => {
  const { styles } = useStyles();
  return (
    <Typography.Text className={styles.title} strong>
      {children}
    </Typography.Text>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  title: css`
    font-size: ${token.fontSizeLG}px;

    ${mq.lg} {
      font-size: ${token.fontSizeXL}px;
    }
  `,
}));
