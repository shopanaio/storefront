"use client";

import { ComponentType, ReactNode } from "react";
import { brandConfig } from "@src/brand.config";
import AntdDrawer from "@src/components/UI/Drawer/Drawer";
import VaulDrawer from "@src/components/UI/Drawer/Vaul";

export type DrawerEngine = "antd" | "vaul";

export interface RootDrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when drawer is closed */
  onClose: () => void;
  /** Optional title shown for the drawer */
  title?: ReactNode;
  /** Optional footer area */
  footer?: ReactNode;
  /** Optional class for content wrapper */
  contentClassName?: string;
  /** Height (used for mobile/bottom sheets by default) */
  height?: string | number;
  /** Placement for AntD drawer (ignored by Vaul) */
  placement?: "left" | "right" | "top" | "bottom";
  /** Width for desktop AntD drawer */
  width?: number | string;
  /** Dynamically imported component to render inside the drawer */
  component?: ComponentType<any>;
  /** Props passed to dynamically imported component */
  componentProps?: Record<string, unknown>;
  /** Children as a fallback content when component is not provided */
  children?: ReactNode;
}

/**
 * Root drawer component that routes to AntD or Vaul implementation
 * depending on active brand configuration. Content should be provided
 * as a next/dynamic component via `component` or plain `children`.
 */
export const RootDrawer = ({
  open,
  onClose,
  title,
  footer,
  contentClassName,
  height,
  placement,
  width,
  component: ContentComponent,
  componentProps,
  children,
}: RootDrawerProps) => {
  const engine: DrawerEngine = "vaul";

  const content = ContentComponent ? (
    <ContentComponent {...(componentProps as any)} />
  ) : (
    children
  );

  if (engine === "vaul") {
    return (
      <VaulDrawer
        open={open}
        onClose={onClose}
        title={title}
        footer={footer}
        contentClassName={contentClassName}
        height={height}
      >
        {content}
      </VaulDrawer>
    );
  }

  return (
    <AntdDrawer
      open={open}
      onClose={onClose}
      placement={placement}
      height={height}
      width={width}
    >
      {content}
    </AntdDrawer>
  );
};

export default RootDrawer;
