'use client';

import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import type { LegalProps } from '../AuthUIProvider';

/** "By continuing, you accept the terms and the privacy policy", linked when the store has them. */
export const DefaultLegal = ({ links, className, style }: LegalProps) => {
  const t = useTranslations('Auth.common');
  const { styles, cx } = useStyles();
  const link = (href: string | undefined) =>
    function LegalLink(chunks: ReactNode) {
      return href ? (
        <a href={href} target="_blank" rel="noreferrer">
          {chunks}
        </a>
      ) : (
        chunks
      );
    };
  return (
    <Typography.Paragraph
      type="secondary"
      className={cx(styles.legal, className)}
      style={style}
    >
      {t.rich('legal', { terms: link(links.terms), privacy: link(links.privacy) })}
    </Typography.Paragraph>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  legal: css`
    && {
      margin: 0;
      font-size: ${token.fontSizeSM}px;
      line-height: ${token.lineHeightSM};
      text-align: center;
    }

    a {
      color: inherit;
      text-decoration: underline;
    }
  `,
}));
