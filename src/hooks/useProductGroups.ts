import { useMemo } from "react";
import { model } from "@shopana/storefront-sdk";
import _ from "lodash";

type PartitionedGroups = {
  multiple: model.ProductGroup[];
  single: model.ProductGroup[];
};

export const useProductGroups = (groups: model.ProductGroup[]): PartitionedGroups => {
  return useMemo(() => {
    const [multiple, single] = _.partition(groups, (group) => (group.items?.length ?? 0) > 1);
    return { multiple, single };
  }, [groups]);
};
