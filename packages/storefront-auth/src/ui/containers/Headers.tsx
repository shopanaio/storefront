'use client';

import { ArrowLeftOutlined, CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useAuthUI } from '../AuthUIProvider';
import type { AuthFlowNavigation } from '../flow/AuthFlow';

/** Header of a store card: "Back" and the logo; the logo alone, centered, on the first screen. */
export const CardHeader = ({ canGoBack, back }: AuthFlowNavigation) => {
  const t = useTranslations('Auth.common');
  const { styles, cx } = useStyles();
  const { components, part } = useAuthUI();
  const { Logo } = components;
  const header = part('header', cx(styles.header, !canGoBack && styles.centered));
  return (
    <div className={header.className} style={header.style}>
      {canGoBack ? (
        <Button type="text" icon={<ArrowLeftOutlined aria-hidden />} onClick={back} className={styles.back}>
          {t('back')}
        </Button>
      ) : null}
      <span className={styles.logo}>
        <Logo />
      </span>
    </div>
  );
};

/** Header of a drawer: "Back" and "Close" icons, no title. */
export const DrawerHeader = ({
  canGoBack,
  back,
  onClose,
}: AuthFlowNavigation & { onClose: () => void }) => {
  const t = useTranslations('Auth.common');
  const { styles } = useStyles();
  const { part } = useAuthUI();
  const header = part('header', styles.header);
  return (
    <div className={header.className} style={header.style}>
      {canGoBack ? (
        <Button type="text" size="large" icon={<ArrowLeftOutlined />} aria-label={t('back')} onClick={back} />
      ) : (
        <span />
      )}
      <Button type="text" size="large" icon={<CloseOutlined />} aria-label={t('close')} onClick={onClose} />
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
