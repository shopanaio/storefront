"use client";

import { useState } from "react";
import { Drawer, Button } from "antd";
import { TbFilter } from "react-icons/tb";
import { createStyles } from "antd-style";
import { ListingFilter } from "./ListingFilter";
import { useTranslations } from "next-intl";
import { ApiFilter } from "@codegen/schema-client";

interface FilterDrawerProps {
  filters: ApiFilter[];
  selectedFilters: Record<
    string,
    { values: string[] | [number, number]; inputs?: string[] }
  >;
  setSelectedFilters: (
    value: React.SetStateAction<
      Record<string, { values: string[] | [number, number]; inputs?: string[] }>
    >
  ) => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  filters,
  selectedFilters,
  setSelectedFilters,
}) => {
  const [open, setOpen] = useState(false);
  const { styles } = useStyles();
  const t = useTranslations("Listing");

  const showDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);

  return (
    <>
      <Button
        className={styles.drawerBtn}
        icon={<TbFilter />}
        onClick={showDrawer}
      >
        {t("filters")}
      </Button>
      <Drawer
        title={t("filters")}
        placement="left"
        onClose={closeDrawer}
        open={open}
        closable={false}
        width={300}
      >
        <ListingFilter
          filters={filters}
          mode="drawer"
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
        />
      </Drawer>
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
  `,
}));
