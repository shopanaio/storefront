'use client';

import { ReactNode } from 'react';
import VaulDrawer from '@src/components/UI/Drawer/Vaul';

export type DrawerEngine = 'antd' | 'vaul';

export interface RootDrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when drawer is closed */
  onClose: () => void;
  /** Called after exit transition finished and content is fully hidden */
  onExited?: () => void;
  /** Minimum height for the drawer content (used by Vaul) */
  minHeight?: string | number;
  /** Whether the drawer can be dismissed by dragging */
  dismissible?: boolean;
  /** Whether the background should scale with the drawer */
  scaleBackground?: boolean;
  /** Direction of the drawer */
  direction?: 'top' | 'bottom' | 'left' | 'right';
  /** Children as a fallback content when component is not provided */
  children: ReactNode;
  /** Whether the drawer should be fullscreen without margins and border radius */
  fullscreen?: boolean;
}

/**
 * Root drawer component that routes to AntD or Vaul implementation
 * depending on active brand configuration. Content should be provided
 * as a next/dynamic component via `component` or plain `children`.
 */
export const RootDrawer = ({
  open,
  onClose,
  onExited,
  // minHeight,
  dismissible = true,
  scaleBackground,
  direction,
  children,
  fullscreen,
}: RootDrawerProps) => {
  return (
    <VaulDrawer
      open={open}
      onClose={onClose}
      onExited={onExited}
      // minHeight={minHeight}
      dismissible={!!dismissible}
      scaleBackground={scaleBackground}
      direction={direction}
      fullscreen={fullscreen}
    >
      {children}
    </VaulDrawer>
  );
};

export default RootDrawer;
