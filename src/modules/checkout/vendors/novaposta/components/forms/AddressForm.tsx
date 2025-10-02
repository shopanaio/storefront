"use client";

import { Flex } from "antd";
import { createStyles } from "antd-style";
import { useFormContext } from "react-hook-form";
import { CityModal, StreetModal } from "../common";

/**
 * Form for Nova Poshta "doors" (courier to door) delivery method.
 */
export function AddressForm() {
  const { styles } = useStyles();
  const form = useFormContext();

  return (
    <Flex vertical gap={12} className={styles.container}>
      <CityModal
        city={form.watch("userCity")}
        changeCity={(c) => form.setValue("userCity", c)}
      />
      <StreetModal
        street={form.watch("userStreet")}
        changeStreet={(s) => form.setValue("userStreet", s)}
        cityRef={form.watch("userCity")?.Ref}
      />
    </Flex>
  );
}

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default AddressForm;
