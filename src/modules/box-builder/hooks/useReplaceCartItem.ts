import { toast } from '@src/components/UI/Toast/Toast';
import useReplaceCartItem from '@src/hooks/cart/useReplaceCartItem';
import { useTranslations } from 'next-intl';

export const useReplaceBoxBuilderCartItem = () => {
  const { replaceCartItem, loading } = useReplaceCartItem();
  const t = useTranslations('toast');

  return {
    replaceCartItem: (input: Parameters<typeof replaceCartItem>[0]) => {
      replaceCartItem(input, {
        onSuccess: () => {},
        onError: () => {
          toast.error(t('replace-failed'));
        },
      });
    },
    loading,
  };
};
