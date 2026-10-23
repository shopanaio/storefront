'use client';

import { Button, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import type { LegalProps } from '../AuthUIProvider';

/**
 * "By signing in, you agree to the terms of personal data processing", linked to the privacy
 * policy when the store has one. It reads like the notice under the checkout's submit button:
 * secondary text, the policy an underlined link within the sentence.
 */
export const DefaultLegal = ({ links, className, style }: LegalProps) => {
  const t = useTranslations('Auth.common');
  const { styles, cx } = useStyles();
  const link = (href: string | undefined) =>
    function LegalLink(chunks: ReactNode) {
      return href ? (
        <Button
          color="default"
          variant="link"
          href={href}
          target="_blank"
          rel="noreferrer"
          className={styles.link}
        >
          {chunks}
        </Button>
      ) : (
        chunks
      );
    };
  return (
    <Typography.Text type="secondary" className={cx(styles.legal, className)} style={style}>
      {t.rich('legal', { privacy: link(links.privacy) })}
    </Typography.Text>
  );
};

const useStyles = createStyles(({ css }) => ({
  legal: css`
    display: block;
    text-align: start;
  `,
  // Inline within the sentence; a long title wraps on a phone instead of running off it.
  link: css`
    && {
      display: inline;
      height: auto;
      padding: 0;
      font-size: inherit;
      line-height: inherit;
      white-space: normal;
      text-align: start;
      text-decoration: underline;
      vertical-align: baseline;
    }
  `,
}));
