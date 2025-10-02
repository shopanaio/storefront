"use client";

import { Flex } from "antd";
import { createStyles } from "antd-style";
import { useFormContext } from "react-hook-form";
import { CityModal, WarehouseModal } from "../common";

/**
 * Form for Nova Poshta "warehouse" (branch pickup) delivery method.
 */
export function WarehouseForm() {
  const { styles } = useStyles();
  const form = useFormContext();

  return (
    <Flex vertical gap={12} className={styles.container}>
      <CityModal
        city={form.watch("userCity")}
        changeCity={(c) => form.setValue("userCity", c)}
      />
      <WarehouseModal
        warehouse={form.watch("userWarehouse")}
        changeWarehouse={(w) => form.setValue("userWarehouse", w)}
        cityName={form.watch("userCity")?.MainDescription}
      />
    </Flex>
  );
}

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default WarehouseForm;
