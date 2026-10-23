'use client';

import { Typography } from 'antd';
import { InlineLink } from '@shopana/storefront-ui';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import type { LegalProps } from '../AuthUIProvider';

export interface DefaultLegalProps extends LegalProps {
  /**
   * Draws the privacy policy in the sentence, e.g. a button that opens it over the page (the
   * checkout). It gets the text of the link and `links.privacy`; by default a link to that page
   * opens in a new tab, and without the page the text is plain.
   */
  renderPrivacyLink?: (
    chunks: ReactNode,
    href: string | undefined
  ) => ReactNode;
}

const defaultPrivacyLink = (chunks: ReactNode, href: string | undefined) =>
  href ? (
    <InlineLink
      color="default"
      underline
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {chunks}
    </InlineLink>
  ) : (
    chunks
  );

/**
 * "By signing in, you agree to the terms of personal data processing", linked to the privacy
 * policy when the store has one. It reads like the notice under the checkout's submit button:
 * secondary text, the policy an underlined link within the sentence.
 */
export const DefaultLegal = ({
  links,
  className,
  style,
  renderPrivacyLink = defaultPrivacyLink,
}: DefaultLegalProps) => {
  const t = useTranslations('Auth.common');
  const { styles, cx } = useStyles();
  return (
    <Typography.Text
      type="secondary"
      className={cx(styles.legal, className)}
      style={style}
    >
      {t.rich('legal', {
        privacy: (chunks) => renderPrivacyLink(chunks, links.privacy),
      })}
    </Typography.Text>
  );
};

const useStyles = createStyles(({ css }) => ({
  legal: css`
    display: block;
    text-align: start;
  `,
}));
