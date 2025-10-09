'use client';

import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
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
  /** Width of the drawer (valid CSS string, used for right direction) */
  width?: string;
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
  width,
}: VaulProps & React.HTMLAttributes<HTMLDivElement>) => {
  const [height, setHeight] = useState(0);
  const { styles } = useStyles();
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const isRightDirection = direction === 'right';

  useEffect(() => {
    if (isRightDirection) return;

    const updateHeight: ResizeObserverCallback = ([{ contentRect }]) => {
      setHeight(contentRect.height);
    };

    const observer = new ResizeObserver(updateHeight);
    if (containerEl) {
      observer.observe(containerEl);
    }

    return () => observer.disconnect();
  }, [containerEl, isRightDirection]);

  const style = useMemo(() => {
    if (isRightDirection) {
      return {
        width: width || '400px',
      };
    }

    return {
      height: `${height}px`,
      minHeight: minHeight,
      maxHeight: `calc(80vh - ${DRAWER_CONTENT_OFFSET_TOP}px)`,
    };
  }, [height, minHeight, isRightDirection, width]);

  useLayoutEffect(() => {
    if (open) {
      document.body.style.height = `${window.innerHeight}px`;
    }
  }, [open]);

  return (
    <Root
      autoFocus
      container={container}
      open={open}
      onClose={onClose}
      dismissible={dismissible}
      repositionInputs
      direction={direction}
      noBodyStyles
      disablePreventScroll
      onAnimationEnd={() => {
        if (!open) {
          document.body.style.height = '';
        }
      }}
    >
      <Portal container={document.querySelector('[data-vaul-drawer-wrapper]')}>
        <Content className={isRightDirection ? styles.contentRight : styles.content} style={isRightDirection ? { width: width || '400px' } : undefined}>
          {!isRightDirection && <div className={styles.handle} />}
          <div className={isRightDirection ? styles.containerRight : styles.container} style={!isRightDirection ? style : undefined}>
            <div ref={setContainerEl}>{children}</div>
          </div>
        </Content>
        <Overlay className={styles.overlay} />
      </Portal>
    </Root>
  );
};

export default Vaul;
