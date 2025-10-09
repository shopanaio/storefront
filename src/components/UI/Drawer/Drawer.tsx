"use client";

import { Drawer as AntdDrawer, DrawerProps as AntdDrawerProps } from "antd";
import { ReactNode } from "react";
import { useIsMobile } from "@src/hooks/useIsMobile";

export interface DrawerProps
  extends Omit<AntdDrawerProps, "children" | "onClose" | "open"> {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when drawer is closed */
  onClose: () => void;
  /** Main content */
  children: ReactNode;
}

/**
 * Default Drawer based on Ant Design's Drawer.
 * Adapts placement and size for mobile vs desktop.
 */
export const Drawer = ({ open, onClose, placement, height, width, children, ...rest }: DrawerProps) => {
  const isMobile = useIsMobile();

  const finalPlacement = placement || (isMobile ? "bottom" : "right");
  const finalHeight = height || (isMobile ? "60vh" : undefined);
  const finalWidth = width || (!isMobile ? "var(--components-drawer-width)" : undefined);

  return (
    <AntdDrawer
      open={open}
      onClose={onClose}
      placement={finalPlacement}
      height={finalHeight}
      width={finalWidth}
      closable={false}
      {...rest}
    >
      {children}
    </AntdDrawer>
  );
};

export default Drawer;
