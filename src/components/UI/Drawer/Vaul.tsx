'use client';

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { Portal, Root, Content, Overlay } from 'vaul';
import { useStyles } from './styles';
import AnimateHeight, { Height } from 'react-animate-height';
import clsx from 'clsx';

export interface VaulProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when drawer is closed */
  onClose: () => void;
  /** Called after exit transition finished and content is fully hidden */
  onExited?: () => void;
  /** Whether the drawer can be dismissed by dragging */
  dismissible: boolean;
  /** Drawer content */
  children: React.ReactNode;
  /** Whether the background should scale with the drawer */
  scaleBackground?: boolean;
  /** Direction of the drawer */
  direction?: 'top' | 'bottom' | 'left' | 'right';
  /** Whether the drawer should be fullscreen without margins and border radius */
  fullscreen?: boolean;
}

export const Vaul = ({
  open,
  onClose,
  onExited,
  dismissible,
  children,
  direction = 'bottom',
  fullscreen,
}: VaulProps & React.HTMLAttributes<HTMLDivElement>) => {
  const { styles } = useStyles();
  const isHorizontal =
    !fullscreen && (direction === 'right' || direction === 'left');
  const isVertical = !isHorizontal && !fullscreen;

  const [height, setHeight] = useState<Height>(0);
  const [contentDiv, setContentDiv] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (open) {
      document.body.style.height = `${window.innerHeight}px`;
      if (isVertical) {
        setHeight('auto');
      }
    }
  }, [open, isVertical]);

  useEffect(() => {
    if (!isVertical || !contentDiv) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    resizeObserver.observe(contentDiv);

    return () => {
      resizeObserver.disconnect();
    };
  }, [contentDiv, isVertical]);

  const handleTeardown = useCallback(() => {
    if (!open) {
      onExited?.();
      document.body.style.height = '';
      if (isVertical) {
        setHeight(0);
      }
    }
  }, [open, isVertical, onExited]);

  const renderContent = () => {
    if (isHorizontal) {
      return <div className={styles.container}>{children}</div>;
    }

    return (
      <>
        {!fullscreen && <div className={styles.handle} />}
        <div className={clsx(styles.container)}>{children}</div>
      </>
    );
  };

  return (
    <Root
      open={open}
      onClose={onClose}
      dismissible={dismissible}
      repositionInputs
      direction={direction}
      onAnimationEnd={handleTeardown}
      disablePreventScroll={false}
    >
      <Portal container={document.querySelector('[data-vaul-drawer-wrapper]')}>
        <Content
          className={clsx({
            [styles.content]: true,
            [styles.contentHorizontal]: isHorizontal,
            [styles.contentVertical]: isVertical,
            [styles.contentLeft]: isHorizontal && direction === 'left',
            [styles.contentRight]: isHorizontal && direction === 'right',
            [styles.contentFullscreen]: fullscreen,
          })}
          style={
            isHorizontal
              ? { width: 'var(--components-drawer-width)' }
              : undefined
          }
        >
          {isVertical ? (
            <AnimateHeight duration={300} height={height} disableDisplayNone>
              <div ref={setContentDiv}>{renderContent()}</div>
            </AnimateHeight>
          ) : (
            renderContent()
          )}
        </Content>
        <Overlay className={styles.overlay} />
      </Portal>
    </Root>
  );
};

export default Vaul;
