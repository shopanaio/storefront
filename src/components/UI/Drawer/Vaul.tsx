"use client";

import { Drawer as VaulDrawer } from "vaul";
import { ReactNode } from "react";
import { useIsMobile } from "@src/hooks/useIsMobile";
import { createStyles, cx } from "antd-style";

export interface VaulProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when drawer is closed */
  onClose: () => void;
  /** Drawer title */
  title?: ReactNode;
  /** Drawer content */
  children: ReactNode;
  /** Optional footer */
  footer?: ReactNode;
  /** Optional class for content */
  contentClassName?: string;
  /** Height for mobile sheets; defaults to 60vh */
  height?: string | number;
}

/**
 * Configured Vaul Drawer (Radix-based bottom sheet).
 * Optimized defaults for mobile; behaves as bottom sheet on mobile, modal-like on desktop.
 */
export const Vaul = ({ open, onClose, title, children, footer, contentClassName, height }: VaulProps) => {
  const isMobile = useIsMobile();
  const sheetHeight = height || (isMobile ? "60vh" : "auto");
  const { styles } = useStyles();

  return (
    <VaulDrawer.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <VaulDrawer.Overlay className={styles.overlay} />
      <VaulDrawer.Content
        className={cx(
          styles.contentBase,
          isMobile ? styles.contentMobile : styles.contentDesktop
        )}
        style={{ height: sheetHeight }}
      >
        {title && <div className={styles.header}>{title}</div>}
        <div className={cx(styles.body, contentClassName)}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </VaulDrawer.Content>
    </VaulDrawer.Root>
  );
};

export default Vaul;

const useStyles = createStyles(({ css, token }) => ({
  overlay: css`
    position: fixed;
    inset: 0;
    background: ${token.colorBgMask};
  `,
  contentBase: css`
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 640px;
    background: ${token.colorBgElevated};
    color: ${token.colorText};
    box-shadow: ${token.boxShadowSecondary};
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `,
  contentMobile: css`
    bottom: 0;
    border-top-left-radius: ${token.borderRadiusLG}px;
    border-top-right-radius: ${token.borderRadiusLG}px;
  `,
  contentDesktop: css`
    top: 10vh;
    bottom: auto;
    max-height: 80vh;
    border-radius: ${token.borderRadiusLG}px;
  `,
  header: css`
    padding: ${token.padding}px;
    border-bottom: 1px solid ${token.colorBorderSecondary};
    font-size: ${token.fontSizeLG}px;
    font-weight: 600;
    text-align: center;
    flex-shrink: 0;
    background: ${token.colorBgElevated};
  `,
  body: css`
    padding: 0 ${token.padding}px;
    flex: 1;
    overflow: auto;
    background: ${token.colorBgBase};
  `,
  footer: css`
    padding: ${token.padding}px;
    border-top: 1px solid ${token.colorSplit};
    background: ${token.colorBgElevated};
    flex-shrink: 0;
  `,
}));
