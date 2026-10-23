'use client';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useAuthUI } from '../AuthUIProvider';
import { AuthIntlProvider } from '../i18n/AuthIntlProvider';

export interface CardHeaderProps {
  /** "Back" on the left; none on the first screen, where the logo is centered. */
  onBack?: () => void;
}

/** Header of a store card: "Back" and the logo of `AuthUIProvider`. */
export const CardHeader = (props: CardHeaderProps) => (
  <AuthIntlProvider>
    <CardHeaderContent {...props} />
  </AuthIntlProvider>
);

const CardHeaderContent = ({ onBack }: CardHeaderProps) => {
  const t = useTranslations('Auth.common');
  const { styles, cx } = useStyles();
  const { components, part } = useAuthUI();
  const { Logo } = components;
  const header = part('header', cx(styles.header, !onBack && styles.centered));
  return (
    <div className={header.className} style={header.style}>
      {onBack ? (
        <Button
          type="text"
          icon={<ArrowLeftOutlined aria-hidden />}
          onClick={onBack}
          className={styles.back}
        >
          {t('back')}
        </Button>
      ) : null}
      <span className={styles.logo}>
        <Logo />
      </span>
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${token.marginXS}px;
    width: 100%;
    min-height: ${token.controlHeight}px;
  `,
  centered: css`
    justify-content: center;
  `,
  back: css`
    && {
      margin-left: -${token.paddingXS}px;
      color: ${token.colorTextSecondary};
    }
  `,
  logo: css`
    display: inline-flex;
    align-items: center;

    &:empty {
      display: none;
    }
  `,
}));
