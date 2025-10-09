import { useMemo } from "react";
import { Entity } from "@shopana/entity";
import _ from "lodash";

type PartitionedGroups = {
  multiple: Entity.ProductGroup[];
  single: Entity.ProductGroup[];
};

export const useProductGroups = (groups: Entity.ProductGroup[]): PartitionedGroups => {
  return useMemo(() => {
    const [multiple, single] = _.partition(groups, (group) => (group.items?.length ?? 0) > 1);
    return { multiple, single };
  }, [groups]);
};
