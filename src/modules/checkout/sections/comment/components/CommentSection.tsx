'use client';

import { useTranslations } from 'next-intl';
import { useForm, FormProvider } from 'react-hook-form';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import RecipientComment from './RecipientComment';

/**
 * Comment section: optional order comment field.
 * Publishes valid with current comment value (may be empty string).
 */
export const CommentSection = () => {
  // Keep i18n hook for future use if needed; currently unused
  useTranslations('Checkout');
  const methods = useForm<{ orderComment: string }>({
    defaultValues: { orderComment: '' },
    mode: 'onChange',
  });
  const { publishValid } = useSectionController<'comment'>('comment', { required: false });

  const value: string = methods.watch('orderComment') ?? '';

  const handleChange = (next: string) => {
    methods.setValue('orderComment', next);
    publishValid({ comment: next });
  };

  return (
    <FormProvider {...methods}>
      <RecipientComment value={value} onChange={handleChange} />
    </FormProvider>
  );
};

export default CommentSection;
