"use client";

import { createStyles, cx } from "antd-style";
import { ReactNode } from "react";

export interface OptionGridProps {
  /** Content to render in the grid */
  children: ReactNode;
  /** Number of columns in the grid */
  columns?: number | "auto-fill" | "auto-fit";
  /** Minimum width for auto columns */
  minColumnWidth?: number;
  /** Gap between items */
  gap?: "xs" | "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

/**
 * Grid component for displaying options.
 * Supports fixed number of columns or automatic determination.
 */
export const OptionGrid = ({
  children,
  columns = "auto-fill",
  gap = "sm",
  className,
}: OptionGridProps) => {
  const { styles } = useStyles();
  const gapValue = gapMap[gap];
  const gridColumns =
    typeof columns === "number"
      ? `repeat(${columns}, 1fr)`
      : `repeat(${columns}, minmax(var(--thumb-size), 1fr))`;

  return (
    <div
      className={cx(styles.grid, className)}
      style={
        {
          "--grid-columns": gridColumns,
          "--grid-gap": `${gapValue}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};

const gapMap = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
};

const useStyles = createStyles(({ css }) => ({
  grid: css`
    display: grid;
    grid-template-columns: var(--grid-columns);
    gap: var(--grid-gap);
  `,
}));

export interface OptionFlexProps {
  /** Content to render in the flex container */
  children: ReactNode;
  /** Gap between items */
  gap?: "xs" | "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

/**
 * Component for displaying options as a flexible container.
 * Elements automatically take space by content and wrap to new line.
 */
export const OptionFlex = ({
  children,
  gap = "sm",
  className,
}: OptionFlexProps) => {
  const { styles } = useFlexStyles();
  const gapValue = gapMap[gap];

  return (
    <div
      className={cx(styles.flex, className)}
      style={
        {
          "--flex-gap": `${gapValue}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};

const useFlexStyles = createStyles(({ css }) => ({
  flex: css`
    display: flex;
    flex-wrap: wrap;
    gap: var(--flex-gap);
  `,
}));
