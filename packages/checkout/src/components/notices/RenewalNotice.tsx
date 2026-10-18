'use client';

import { Alert, Button } from 'antd';
import { useTranslations } from 'next-intl';
import { useRenewalStore } from '#checkout/state/renewal';

/** Tells the buyer that an expired checkout was replaced, or that replacing it failed (R5). */
export const RenewalNotice = () => {
  const t = useTranslations('Checkout');
  const state = useRenewalStore((store) => store.state);
  const retry = useRenewalStore((store) => store.retry);
  const setState = useRenewalStore((store) => store.setState);

  if (state === 'renewed') {
    return (
      <Alert
        type="info"
        showIcon
        closable
        onClose={() => setState('idle')}
        title={t('checkout-renewed-title')}
        description={t('checkout-renewed-description')}
      />
    );
  }
  if (state === 'failed') {
    return (
      <Alert
        type="error"
        showIcon
        title={t('checkout-renew-failed')}
        action={
          retry ? (
            <Button size="small" onClick={retry}>
              {t('retry')}
            </Button>
          ) : null
        }
      />
    );
  }
  return null;
};
