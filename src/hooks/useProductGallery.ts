import { useMemo } from 'react';
import type { model } from '@shopana/storefront-sdk';

export const useProductGallery = (
  variant: model.ProductVariant,
  product: model.Product
): model.Media[] => {
  return useMemo(() => {
    const seen = new Set<string>();
    const result: model.Media[] = [];

    const append = (media?: model.Media | null) => {
      if (!media) return;

      const key = media.id ?? media.url;
      if (!key || seen.has(key)) return;

      seen.add(key);
      result.push(media);
    };

    append(variant?.cover ?? null);

    variant?.gallery?.edges?.forEach((edge) => {
      append(edge?.node ?? null);
    });

    product?.groups?.forEach((group) => {
      group?.items?.forEach((item) => {
        append(item?.node?.cover ?? null);
      });
    });

    return result;
  }, [variant?.cover, variant?.gallery, product?.groups]);
};
