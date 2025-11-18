'use client';

import { ComponentType, useEffect, useMemo } from 'react';
import { AnySchema } from 'yup';
import { useWishlistData } from '@src/modules/wishlist/context/WishlistDataContext';
import { WishlistSectionId, WishlistSnapshot } from '@src/modules/wishlist/types';
import { useSectionController } from '@src/modules/wishlist/state/hooks/useSectionController';
import { extractYupErrors } from '@src/modules/checkout/utils/validation';

interface Props<K extends WishlistSectionId, TData> {
  id: K;
  required?: boolean;
  Component: ComponentType<{
    data: TData | null;
    invalidate: () => void;
  }>;
  selector?: (snapshot: WishlistSnapshot) => TData | null;
  schema?: AnySchema;
}

export const SectionContainer = <
  K extends WishlistSectionId,
  TData extends object,
>({
  id,
  required = true,
  Component,
  selector,
  schema,
}: Props<K, TData>) => {
  const { wishlist } = useWishlistData();
  const { publishInvalid, publishValid } = useSectionController(id, {
    required,
  });

  const data = useMemo(() => {
    if (!selector) {
      return null;
    }
    return selector(wishlist);
  }, [wishlist, selector]);

  useEffect(() => {
    if (!schema) {
      publishValid();
      return;
    }

    schema
      .validate(data, { abortEarly: false })
      .then(() => publishValid())
      .catch((error) => publishInvalid(extractYupErrors(error)));
  }, [data, schema, publishValid, publishInvalid]);

  return (
    <Component
      data={data}
      invalidate={() => {
        publishInvalid({});
      }}
    />
  );
};
