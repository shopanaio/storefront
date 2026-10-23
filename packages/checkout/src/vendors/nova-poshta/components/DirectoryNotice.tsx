'use client';

import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin, Typography } from 'antd';
import { Banner } from '@shopana/storefront-ui';
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
      <Banner
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
    return (
      <Flex gap={8} align="center">
        <Spin size="small" indicator={<LoadingOutlined spin />} />
        <Typography.Text type="secondary">{t('form.loading')}</Typography.Text>
      </Flex>
    );
  }
  if (empty) {
    return (
      <Typography.Text type="secondary">{t('form.empty')}</Typography.Text>
    );
  }
  return null;
}
