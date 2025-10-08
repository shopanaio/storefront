import { useMemo } from "react";
import type * as Entity from "@src/entity/namespace";

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
