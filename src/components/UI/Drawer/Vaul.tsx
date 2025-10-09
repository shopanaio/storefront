'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Portal, Root, Content, Overlay } from 'vaul';
import { useStyles, DRAWER_CONTENT_OFFSET_TOP } from './styles';

export interface VaulProps {
  /** Container element for portal */
  container?: HTMLElement | null;
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when drawer is closed */
  onClose: () => void;
  /** Whether the drawer can be dismissed by dragging */
  dismissible: boolean;
  /** Minimum height for the drawer content */
  minHeight?: string | number;
  /** Drawer content */
  children: React.ReactNode;
  /** Whether the background should scale with the drawer */
  scaleBackground?: boolean;
  /** Direction of the drawer */
  direction?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Vaul Drawer component with dynamic height calculation and custom styles.
 */
export const Vaul = ({
  container,
  open,
  onClose,
  dismissible,
  minHeight,
  children,
  scaleBackground,
  direction,
}: VaulProps & React.HTMLAttributes<HTMLDivElement>) => {
  const [height, setHeight] = useState(0);
  const { styles } = useStyles();
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateHeight: ResizeObserverCallback = ([{ contentRect }]) => {
      setHeight(contentRect.height);
    };

    const observer = new ResizeObserver(updateHeight);
    if (containerEl) {
      observer.observe(containerEl);
    }

    return () => observer.disconnect();
  }, [containerEl]);

  const style = useMemo(
    () => ({
      height: `${height + DRAWER_CONTENT_OFFSET_TOP}px`,
      minHeight: minHeight,
      maxHeight: `calc(90vh - ${DRAWER_CONTENT_OFFSET_TOP}px)`,
    }),
    [height, minHeight]
  );

  return (
    <Root
      autoFocus
      container={container}
      open={open}
      onClose={onClose}
      dismissible={dismissible}
      repositionInputs
      shouldScaleBackground={scaleBackground}
      direction={direction}
    >
      <Portal>
        <Content className={styles.content}>
          <div className={styles.handle} />
          <div className={styles.container} style={style}>
            <div ref={setContainerEl}>{children}</div>
          </div>
        </Content>
        <Overlay className={styles.overlay} />
      </Portal>
    </Root>
  );
};

export default Vaul;
