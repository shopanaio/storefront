import { useMemo } from "react";
import type { Entity } from "@shopana/entity";

export const useProductGallery = (product: Entity.Product): Entity.Media[] => {
  return useMemo(() => {
    return [
      ...product?.gallery?.edges.map((it) => it.node),
      ...(product?.groups
        .flatMap((g) => g.items.map((item) => item?.node?.cover))
        .filter(Boolean) as Entity.Media[]),
    ];
  }, [product.gallery, product.groups]);
};
