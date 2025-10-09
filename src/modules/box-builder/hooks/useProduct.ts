import { useLazyLoadQuery } from 'react-relay';
import { ProductQuery as ProductQueryType } from '@src/hooks/product/ProductQuery/__generated__/ProductQuery.graphql';
import { ProductQuery } from '@src/hooks/product/ProductQuery';

export const useProduct = (handle: string) => {
  const data = useLazyLoadQuery<ProductQueryType>(
    ProductQuery,
    { handle },
    { fetchPolicy: 'store-or-network' }
  );

  const product = data?.product ?? null;

  return {
    product,
    error: null,
    loading: false,
  };
};
