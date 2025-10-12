import { App } from "antd";
import type { ModalFuncProps } from "antd";
import { useCallback } from "react";
import { createRoot } from "react-dom/client";
import { useIsMobile } from "@src/hooks/useIsMobile";
import { mobileConfirmApi } from "@src/components/UI/Confirm/mobileConfirmStore";
import dynamic from "next/dynamic";

/**
 * Returns a confirm function that opens Ant Design confirm modal and resolves to user's choice.
 * No global defaults applied; all options are passed-through as provided.
 * On mobile devices, renders a custom Drawer-based confirmation via a portal.
 */
export function useConfirm() {
  const { modal } = App.useApp();
  const isMobile = useIsMobile();
  const MobileConfirmDrawer = dynamic(() => import("./MobileConfirmDrawer"), {
    ssr: false,
  });

  return useCallback(
    (options: ModalFuncProps) =>
      new Promise<boolean>((resolve) => {
        const { onOk, onCancel, ...rest } = options;

        if (isMobile && typeof window !== "undefined") {
          // Mount singleton portal host if needed and render drawer component
          let container = document.getElementById("mobile-confirm-root");
          if (!container) {
            container = document.createElement("div");
            container.id = "mobile-confirm-root";
            document.body.appendChild(container);
            const root = createRoot(container);
            root.render(<MobileConfirmDrawer />);
          }

          mobileConfirmApi.open(rest, async (ok) => {
            try {
              if (ok) {
                await onOk?.();
              } else {
                onCancel?.();
              }
            } finally {
              resolve(ok);
            }
          });
          return;
        }

        // Desktop: fallback to AntD confirm
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
    [modal, isMobile]
  );
}
