'use client';

import { Modal, Skeleton, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useQuery } from '@apollo/client/react';
import { storePolicyQuery } from '#checkout/api/queries/storePolicyQuery.shopana';

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
 * A store policy over the checkout, so the buyer reads it without leaving the order. The body is
 * HTML the API sanitized. The policy page stays one link away, also when the policy cannot be read.
 */
export const PolicyModal = ({ policy, onClose }: PolicyModalProps) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const { data, loading } = useQuery(storePolicyQuery, {
    variables: { handle: policy?.handle ?? '' },
    skip: !policy,
  });
  const loaded =
    data?.storePolicy?.handle === policy?.handle ? data?.storePolicy : null;
  const html = typeof loaded?.body?.html === 'string' ? loaded.body.html : '';

  let content: React.ReactNode;
  if (loaded) {
    content = (
      <div className={styles.body} dangerouslySetInnerHTML={{ __html: html }} />
    );
  } else if (loading) {
    content = <Skeleton active paragraph={{ rows: 6 }} title={false} />;
  } else {
    // Unpublished since the checkout was read, or not readable now.
    content = <Text type="secondary">{t('policy-load-error')}</Text>;
  }

  return (
    <Modal
      open={policy !== null}
      onCancel={onClose}
      title={loaded?.title ?? policy?.title}
      footer={
        policy ? (
          <Link
            href={loaded?.path ?? policy.path}
            target="_blank"
            rel="noopener"
          >
            {t('policy-open-page')}
          </Link>
        ) : null
      }
      width={720}
      centered
      destroyOnHidden
    >
      {content}
    </Modal>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  body: css`
    max-height: 60vh;
    overflow-y: auto;
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
}));
