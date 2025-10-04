'use client';

import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { useState, useEffect } from 'react';
import { PromoForm } from './PromoForm';
import { useTranslations } from 'next-intl';

export const PromoSection = () => {
  const t = useTranslations('Checkout');
  const { publishValid, publishInvalid } = useSectionController('promo', { required: false });
  const [code, setCode] = useState('');

  useEffect(() => {
    if (!code) {
      publishInvalid(undefined);
    }
  }, [code, publishInvalid]);

  return (
    <PromoForm
      code={code}
      label={t('coupon-code')}
      applyText={t('apply')}
      removeText={t('remove')}
      onChange={(next) => setCode(next)}
      onSubmit={(c) => {
        if (c) publishValid({ code: c });
        else publishInvalid({ code: 'required' });
      }}
      onRemove={(c) => {
        setCode('');
        publishInvalid({ code: c });
      }}
    />
  );
};
export default PromoSection;
