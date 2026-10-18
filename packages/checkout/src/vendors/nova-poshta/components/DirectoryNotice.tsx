'use client';

import { Alert, Button, Typography } from 'antd';
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
      <Alert
        type={error === 'invalid' ? 'info' : 'warning'}
        showIcon
        message={t(`errors.${error}`)}
        action={
          error === 'invalid' ? null : (
            <Button size="small" onClick={onRetry}>
              {t('errors.retry')}
            </Button>
          )
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
