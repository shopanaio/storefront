'use client';

import { Spin } from 'antd';
import { VisuallyHidden } from '@shopana/storefront-ui';
import { useTranslations } from 'next-intl';

/** The spinner of a page until the link of its address is read, named for a screen reader. */
export const PageLoading = () => {
  const t = useTranslations('Auth.common');
  return (
    <div role="status" style={{ display: 'flex', justifyContent: 'center' }}>
      <Spin size="large" />
      <VisuallyHidden>{t('loading')}</VisuallyHidden>
    </div>
  );
};
