"use client";

import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { useFormContext } from "react-hook-form";
import type { ProviderProps } from "@src/modules/registry";

const { Text } = Typography;

/**
 * NovaPoshta payment provider-level component. Uses react-hook-form via context.
 */
export function NovaPoshtaPaymentProvider({ provider, methods, locale }: ProviderProps) {
  const { styles } = useStyles();
  const form = useFormContext<any>();

  const activePayment: string | undefined = form?.watch?.("payment");

  const handleSelect = (code: string) => {
    form?.setValue?.("payment", code, { shouldDirty: true, shouldTouch: true });
  };

  return (
    <Flex vertical gap={12} className={styles.container}>
      <Flex gap={8} wrap>
        {methods.map((m) => (
          <button
            key={m.code}
            className={m.code === activePayment ? styles.methodActive : styles.method}
            type="button"
            onClick={() => handleSelect(m.code)}
          >
            {m.label ?? m.code}
          </button>
        ))}
      </Flex>
      {/* Доп. поля для оплаты (если нужны) можно добавить тут */}
      <Text type="secondary">Provider: {provider}</Text>
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
