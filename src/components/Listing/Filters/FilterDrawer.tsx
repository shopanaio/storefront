"use client";

import { useState, useRef } from "react";
import { Button, Badge, Flex } from "antd";
import { TbFilter } from "react-icons/tb";
import { createStyles } from "antd-style";
import { ListingFilter } from "./ListingFilter";
import { useTranslations } from "next-intl";
import { useActiveFiltersCount } from "@src/hooks/useActiveFiltersCount";
import { ApiFilter } from "@codegen/schema-client";
import { mq } from "@src/components/Theme/breakpoints";
import { MobileStyleDrawer } from "@src/components/UI/MobileStyleDrawer";
import { useFiltersStore } from "@src/store/appStore";

interface FilterDrawerProps {
  filters: ApiFilter[];
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  filters,
}) => {
  const [open, setOpen] = useState(false);
  const { styles } = useStyles();
  const t = useTranslations("Listing");
  const applyFiltersRef = useRef<(() => void) | null>(null);
  const { selectedFilters, setSelectedFilters } = useFiltersStore();

  const showDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);

  const { activeFiltersCount, hasActiveFilters } = useActiveFiltersCount({
    selectedFilters
  });

  const handleReset = () => {
    if (hasActiveFilters) {
      // Reset in drawer should also apply immediately and close
      setSelectedFilters({});
      closeDrawer();
    }
  };

  const headerActions = (
    <Button className={styles.resetBtn} onClick={handleReset} type="link">
      {t("reset")}
    </Button>
  );

  const handleApplyFilters = () => {
    if (applyFiltersRef.current) {
      applyFiltersRef.current();
      closeDrawer();
    }
  };

  const onProvideApplyFunction = (applyFn: () => void) => {
    applyFiltersRef.current = applyFn;
  };

  const footerContent = (
    <Flex className={styles.footerWrapper}>
      <Button
        type="primary"
        size="large"
        block
        onClick={handleApplyFilters}
        style={{ height: 48 }}
      >
        {t("apply-filters")}
      </Button>
    </Flex>
  );

  return (
    <>
      <Button
        className={styles.drawerBtn}
        icon={<TbFilter />}
        onClick={showDrawer}
      >
        {t("filters")}
        {hasActiveFilters && (
          <Badge color="blue" count={activeFiltersCount} size="small" />
        )}
      </Button>

      <MobileStyleDrawer
        open={open}
        onClose={closeDrawer}
        title={t("filters")}
        headerActions={headerActions}
        footer={footerContent}
      >
        <ListingFilter
          filters={filters}
          mode="drawer"
          onProvideApplyFunction={onProvideApplyFunction}
        />
      </MobileStyleDrawer>
    </>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  drawerBtn: css`
    display: flex;
    justify-content: start;
    width: 100%;
    border-radius: ${token.borderRadius}px;
    border-color: ${token.colorBorder};

    ${mq.lg} {
      width: fit-content;
    }
  `,
  resetBtn: css`
    padding: 0;
  `,
  footerWrapper: css`
    bottom: 0;
    margin-top: auto;
    position: sticky;
  `,
}));
