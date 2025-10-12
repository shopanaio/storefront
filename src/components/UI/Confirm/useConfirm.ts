import { App } from "antd";
import type { ModalFuncProps } from "antd";
import { useCallback } from "react";

/**
 * Returns a confirm function that opens Ant Design confirm modal and resolves to user's choice.
 * No global defaults applied; all options are passed-through as provided.
 */
export function useConfirm() {
  const { modal } = App.useApp();

  return useCallback(
    (options: ModalFuncProps) =>
      new Promise<boolean>((resolve) => {
        const { onOk, onCancel, ...rest } = options;
        modal.confirm({
          ...rest,
          onOk: async (...args) => {
            try {
              await onOk?.(...(args as any));
            } finally {
              resolve(true);
            }
          },
          onCancel: (...args) => {
            try {
              onCancel?.(...(args as any));
            } finally {
              resolve(false);
            }
          },
        });
      }),
    [modal]
  );
}
