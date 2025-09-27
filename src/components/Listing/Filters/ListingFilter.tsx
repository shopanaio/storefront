"use client";

import React, { useEffect } from "react";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import type { ApiFilter } from "@codegen/schema-client";
import { useFilterActions } from "@src/hooks/useFilterActions";
import { useFiltersStore } from "@src/store/appStore";
import { useDraftFilters } from "@src/hooks/useDraftFilters";
import { FilterItem } from "./FilterItem";
import { mq } from "@src/components/Theme/breakpoints";

interface ListingFilterProps {
  onClose?: () => void;
  filters: ApiFilter[];
  mode?: "sidebar" | "drawer";
  /** Callback to provide apply function to parent */
  onProvideApplyFunction?: (applyFn: () => void) => void;
}

export const ListingFilter: React.FC<ListingFilterProps> = ({
  onClose,
  filters,
  mode = "sidebar",
  onProvideApplyFunction,
}) => {
  const t = useTranslations("Listing");
  const { styles } = useStyles();
  const { selectedFilters, setSelectedFilters } = useFiltersStore();

  // Use custom hook for draft filters management
  const { draftFilters, getFilterValue, updateFilter } = useDraftFilters(
    mode,
    selectedFilters
  );

  const { handleResetAll } = useFilterActions({
    filters,
    selectedFilters,
    setSelectedFilters,
  });

  /**
   * Applies all draft filters to actual filters
   */
  const handleApplyAllFilters = () => {
    setSelectedFilters(draftFilters);
  };

  // Provide apply function to parent component for drawer mode
  useEffect(() => {
    if (onProvideApplyFunction && mode === "drawer") {
      onProvideApplyFunction(handleApplyAllFilters);
    }
  }, [onProvideApplyFunction, mode, draftFilters, handleApplyAllFilters]);

  const containerStyle = mode === "sidebar" ? styles.sidebarWrapper : styles.drawerWrapper;

  return (
    <div className={containerStyle}>
      {filters.map((filter) => (
        <FilterItem
          key={filter.handle}
          filter={filter}
          value={getFilterValue(filter.handle)}
          onUpdate={(handle, value) => updateFilter(handle, value, setSelectedFilters)}
        />
      ))}
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  sidebarWrapper: css`
    display: none;
    ${mq.lg} {
      display: flex;
      flex-direction: column;
      min-width: 260px;
      max-width: 260px;
      padding: 0 ${token.padding}px;
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadius}px;
      height: fit-content;
    }
  `,
  drawerWrapper: css`
    display: block;
  `,
  filterHeader: css`
    width: 100%;
    margin-bottom: ${token.marginXXS}px;
  `,
  filterTitle: css`
    font-size: ${token.fontSize}px;
    font-weight: 600;
    ${mq.lg} {
      font-size: ${token.fontSizeLG}px;
    }
  `,
  resetBtn: css`
    padding: 0;
  `,
  closeBtn: css`
    &:hover {
      color: ${token.colorPrimary} !important;
    }
  `,
  divider: css`
    margin-top: 0;
    margin-bottom: 0;
  `,
}));
