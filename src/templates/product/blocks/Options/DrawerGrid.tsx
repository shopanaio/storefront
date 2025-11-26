"use client";

import { OptionGrid, type OptionGridProps } from "@src/ui-kit/OptionGrid";

export type DrawerGridProps = Omit<OptionGridProps, 'gap'> & {
  gap?: OptionGridProps['gap'];
};

/**
 * Wrapper for OptionGrid with drawer-specific defaults
 */
export const DrawerGrid = ({
  columns = 2,
  gap = "md",
  className,
  ...props
}: DrawerGridProps) => {
  return (
    <OptionGrid
      columns={columns}
      gap={gap}
      className={className}
      {...props}
    />
  );
};
