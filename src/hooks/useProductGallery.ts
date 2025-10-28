import { useMemo } from 'react';
import type { Entity } from '@shopana/entity';

export const useProductGallery = (
  variant: Entity.ProductVariant,
  product: Entity.Product
): Entity.Media[] => {
  return useMemo(() => {
    const seen = new Set<string>();
    const result: Entity.Media[] = [];

    const append = (media?: Entity.Media | null) => {
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
