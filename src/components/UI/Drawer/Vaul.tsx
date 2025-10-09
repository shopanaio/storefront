'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  direction,
}: VaulProps & React.HTMLAttributes<HTMLDivElement>) => {
  const { styles } = useStyles();
  const isRightDirection = direction === 'right';
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [viewportHeight, setViewportHeight] = useState<number>(0);

  useLayoutEffect(() => {
    if (open) {
      document.body.style.height = `${window.innerHeight}px`;
    }
  }, [open]);

  useEffect(() => {
    setViewportHeight(window.innerHeight);
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    const observer = new ResizeObserver(([entry]) => {
      setContentHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [contentRef]);

  const maxAvailable = Math.max(
    0,
    viewportHeight * 0.8 - DRAWER_CONTENT_OFFSET_TOP,
  );
  const targetHeight = Math.min(contentHeight, maxAvailable);

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
        <Content
          className={isRightDirection ? styles.contentRight : styles.content}
          style={
            isRightDirection
              ? { width: 'var(--components-drawer-width)' }
              : undefined
          }
        >
          {!isRightDirection && <div className={styles.handle} />}
          {isRightDirection ? (
            <div className={styles.containerRight}>
              <div className={styles.containerContent}>{children}</div>
            </div>
          ) : (
            <div
              className={styles.container}
              style={{ height: targetHeight ? `${targetHeight}px` : undefined }}
            >
              <div
                ref={contentRef}
                className={styles.containerContent}
                style={{ minHeight: minHeight }}
              >
                {children}
              </div>
            </div>
          )}
        </Content>
        <Overlay className={styles.overlay} />
      </Portal>
    </Root>
  );
};

export default Vaul;
