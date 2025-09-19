import { useMemo } from "react";
import { ApiFile, ApiProduct } from "@codegen/schema-client";

export const useProductGallery = (product: ApiProduct): ApiFile[] => {
  return useMemo(() => {
    return [
      ...product?.gallery?.edges.map((it) => it.node),
      ...(product?.groups
        .flatMap((g) => g.items.map((item) => item?.product?.cover))
        .filter(Boolean) as ApiFile[]),
    ];
  }, [product.gallery, product.groups]);
};
