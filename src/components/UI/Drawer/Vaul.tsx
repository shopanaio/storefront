'use client';

import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Portal, Root, Content, Overlay } from 'vaul';
import { useStyles } from './styles';
import AnimateHeight, { Height } from 'react-animate-height';

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

  const [height, setHeight] = useState<Height>('auto');
  const [contentDiv, setContentDiv] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (open) {
      document.body.style.height = `${window.innerHeight}px`;
    }
  }, [open]);

  useEffect(() => {
    if (!contentDiv) return;
    const resizeObserver = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    resizeObserver.observe(contentDiv);
    return () => {
      resizeObserver.disconnect();
    };
  }, [contentDiv]);

  console.log(height, 'height');
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
          <AnimateHeight
            duration={500}
            height={height}
            contentClassName="auto-content"
            disableDisplayNone
          >
            <div ref={setContentDiv}>
              {!isRightDirection && <div className={styles.handle} />}
              {isRightDirection ? (
                <div className={styles.containerRight}>
                  <div className={styles.containerContent}>{children}</div>
                </div>
              ) : (
                <div className={styles.container}>{children}</div>
              )}
            </div>
          </AnimateHeight>
        </Content>
        <Overlay className={styles.overlay} />
      </Portal>
    </Root>
  );
};

export default Vaul;
