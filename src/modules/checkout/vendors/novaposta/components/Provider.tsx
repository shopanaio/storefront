"use client";

import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { useFormContext } from "react-hook-form";
import type { ProviderProps } from "@src/modules/registry";
import { CityModal } from "./CityModal";
import { StreetModal } from "./StreetModal";
import { WarehouseModal } from "./WarehouseModal";

const { Text } = Typography;

/**
 * NovaPoshta provider-level component that renders full shipping UI.
 * Uses react-hook-form via useFormContext.
 */
export function NovaPoshtaProvider({
  provider,
  methods,
  locale,
}: ProviderProps) {
  const { styles } = useStyles();
  const form = useFormContext<any>();

  const activeCode: string | undefined = form?.watch?.("activeShippingKey");

  // Ensure there is always a valid active method code selected
  const allCodes = methods.map((m) => m.code);
  if (!activeCode || !allCodes.includes(activeCode)) {
    if (allCodes.length > 0) {
      form?.setValue?.("activeShippingKey", allCodes[0], {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }

  const handleSelectMethod = (code: string) => {
    form?.setValue?.("activeShippingKey", code, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  // Normalize provider-specific codes into UI variants
  const isWarehouseVariant = Boolean(activeCode && activeCode.endsWith("_warehouse"));
  const isAddressVariant = Boolean(activeCode && activeCode.endsWith("_doors"));

  return (
    <Flex vertical gap={16} className={styles.container}>
      <Flex gap={8} wrap>
        {methods.map((m) => (
          <button
            key={m.code}
            className={
              m.code === activeCode ? styles.methodActive : styles.method
            }
            type="button"
            onClick={() => handleSelectMethod(m.code)}
          >
            {m.label ?? m.code}
          </button>
        ))}
      </Flex>

      {/* Render UI for the active method */}
      {isWarehouseVariant && (
        <Flex vertical gap={12}>
          <Text>City</Text>
          <CityModal
            city={form.watch("userCity")}
            changeCity={(c) => form.setValue("userCity", c)}
          />
          <Text>Warehouse</Text>
          <WarehouseModal
            warehouse={form.watch("userWarehouse")}
            changeWarehouse={(w) => form.setValue("userWarehouse", w)}
            cityName={form.watch("userCity")?.MainDescription}
          />
        </Flex>
      )}

      {isAddressVariant && (
        <Flex vertical gap={12}>
          <Text>City</Text>
          <CityModal
            city={form.watch("userCity")}
            changeCity={(c) => form.setValue("userCity", c)}
          />
          <Flex gap={12}>
            <Flex vertical gap={8}>
              <Text>Street</Text>
              <StreetModal
                street={form.watch("userStreet")}
                changeStreet={(s) => form.setValue("userStreet", s)}
                cityRef={form.watch("userCity")?.Ref}
              />
            </Flex>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    width: 100%;
  `,
  method: css`
    padding: ${token.paddingXS}px ${token.padding}px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
    cursor: pointer;
  `,
  methodActive: css`
    padding: ${token.paddingXS}px ${token.padding}px;
    border: 1px solid ${token.colorPrimary};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorPrimaryBg};
    cursor: pointer;
  `,
}));
