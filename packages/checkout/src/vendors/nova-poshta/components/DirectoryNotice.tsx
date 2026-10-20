'use client';

import { Typography } from 'antd';
import { CheckoutBanner } from '#checkout/ui/banner/CheckoutBanner';
import { useTranslations } from 'next-intl';
import type { DirectoryError } from '../api/directory';

interface DirectoryNoticeProps {
  loading: boolean;
  error: DirectoryError | null;
  empty: boolean;
  onRetry: () => void;
}

/** Loading, empty and failure states of a directory list. */
export function DirectoryNotice({
  loading,
  error,
  empty,
  onRetry,
}: DirectoryNoticeProps) {
  const t = useTranslations('Modules.novaPoshta');

  if (error) {
    return (
      <CheckoutBanner
        tone={error === 'invalid' ? 'action' : 'warning'}
        title={t(`errors.${error}`)}
        action={
          error === 'invalid'
            ? undefined
            : { label: t('errors.retry'), onClick: onRetry }
        }
      />
    );
  }
  if (loading) {
    return <Typography.Text type="secondary">{t('form.loading')}</Typography.Text>;
  }
  if (empty) {
    return <Typography.Text type="secondary">{t('form.empty')}</Typography.Text>;
  }
  return null;
}
