import { useMemo } from "react";
import { ApiProductGroup } from "@codegen/schema-client";
import _ from "lodash";

type PartitionedGroups = {
  multiple: ApiProductGroup[];
  single: ApiProductGroup[];
};

export const useProductGroups = (groups: ApiProductGroup[]): PartitionedGroups => {
  return useMemo(() => {
    const [multiple, single] = _.partition(groups, (group) => (group.items?.length ?? 0) > 1);
    return { multiple, single };
  }, [groups]);
};
