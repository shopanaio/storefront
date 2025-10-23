'use client';

import React, { ReactElement, ReactNode } from 'react';
import VaulDrawer from '@src/components/UI/Drawer/Vaul';
import { Drawer } from 'antd';
import { Overlay } from '@src/components/UI/Overlay/Overlay';

export type DrawerEngine = 'antd' | 'vaul' | 'overlay';

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
  /** Drawer engine */
  engine?: DrawerEngine;
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
  engine = 'antd',
  ...drawerProps
}: RootDrawerProps) => {
  if (engine === 'overlay') {
    return (
      <Overlay open={open} onClose={onClose}>
        {children}
      </Overlay>
    );
  }

  if (engine === 'antd') {
    return (
      <Drawer
        open={open}
        onClose={onClose}
        //
        placement={direction}
        // height={finalHeight}
        closable={false}
        styles={{ wrapper: { overscrollBehavior: 'none' } }}
        drawerRender={(node) =>
          React.cloneElement(node as ReactElement, {}, children)
        }
        {...drawerProps}


        // onExited={onExited}
        // // minHeight={minHeight}
        // dismissible={!!dismissible}
        // scaleBackground={scaleBackground}
        // direction={direction}
        // fullscreen={fullscreen}
      >
        {children}
      </Drawer>
    );
  }

  return (
    <VaulDrawer
      open={open}
      onClose={onClose}
      onExited={onExited}
      // minHeight={minHeight}
      dismissible={!!dismissible}
      scaleBackground={scaleBackground}
      direction={direction}
    >
      {children}
    </VaulDrawer>
  );
};

export default RootDrawer;
