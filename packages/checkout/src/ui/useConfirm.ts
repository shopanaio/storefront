'use client';

import { App } from 'antd';
import type { ModalFuncProps } from 'antd';
import { useCallback } from 'react';

export function useConfirm() {
  const { modal } = App.useApp();
  return useCallback(
    (options: ModalFuncProps) =>
      new Promise<boolean>((resolve) => {
        modal.confirm({
          ...options,
          onOk: async (...args) => {
            await options.onOk?.(...args);
            resolve(true);
          },
          onCancel: (...args) => {
            options.onCancel?.(...args);
            resolve(false);
          },
        });
      }),
    [modal]
  );
}
