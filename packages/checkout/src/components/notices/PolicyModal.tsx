'use client';

import { useState } from 'react';
import { Skeleton, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { mq, ResponsiveDialog } from '@shopana/storefront-ui';
import { useStorePolicy } from '#checkout/hooks/useStorePolicy';

const { Link, Text } = Typography;

export interface PolicyModalPolicy {
  handle: string;
  title: string;
  /** Storefront path of the policy page. */
  path: string;
}

export interface PolicyModalProps {
  /** The policy to show; `null` keeps the modal closed. */
  policy: PolicyModalPolicy | null;
  onClose: () => void;
}

/**
 * A store policy over the checkout, so the buyer reads it without leaving the order: a modal on
 * desktop, a bottom sheet on mobile, as the other drawers of the checkout. The body is HTML the
 * API sanitized. The policy page stays one link away, also when the policy cannot be read.
 */
export const PolicyModal = ({ policy, onClose }: PolicyModalProps) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  // The last opened policy stays until the closing animation ends, so it does not blank out.
  const [shown, setShown] = useState(policy);
  if (policy && policy !== shown) setShown(policy);
  const current = policy ?? shown;
  const { policy: loaded, loading } = useStorePolicy(current?.handle ?? null);

  let content: React.ReactNode;
  if (loaded) {
    content = (
      <div
        className={styles.body}
        dangerouslySetInnerHTML={{ __html: loaded.html }}
      />
    );
  } else if (loading) {
    content = <Skeleton active paragraph={{ rows: 6 }} title={false} />;
  } else {
    // Unpublished since the checkout was read, or not readable now.
    content = <Text type="secondary">{t('policy-load-error')}</Text>;
  }
  const pageLink = current ? (
    <Link href={loaded?.path ?? current.path} target="_blank" rel="noopener">
      {t('policy-open-page')}
    </Link>
  ) : null;

  // Opened from a drawer (the sign-in's consent), the dialog stands over it by itself.
  return (
    <ResponsiveDialog
      open={policy !== null}
      onClose={onClose}
      onExited={() => setShown(null)}
      title={loaded?.title ?? current?.title}
      footer={pageLink}
      width={720}
      // A bottom sheet below lg, as the other drawers of the checkout.
      breakpoint="lg"
      classNames={{ body: styles.scroll }}
    >
      {content}
    </ResponsiveDialog>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  body: css`
    overflow-wrap: anywhere;

    & > :first-child {
      margin-top: 0;
    }
    & > :last-child {
      margin-bottom: 0;
    }
    & a {
      color: ${token.colorLink};
    }
  `,
  // The bottom sheet scrolls itself; the modal keeps its footer in view.
  scroll: css`
    ${mq.lg} {
      max-height: 60vh;
      overflow-y: auto;
    }
  `,
}));
