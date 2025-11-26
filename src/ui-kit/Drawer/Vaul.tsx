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
  /** Whether the drawer should be fullscreen on mobile */
  isFullscreen?: boolean;
}

export const Vaul = ({
  open,
  onClose,
  onExited,
  dismissible,
  children,
  direction = 'bottom',
  isFullscreen,
}: VaulProps & React.HTMLAttributes<HTMLDivElement>) => {
  const { styles } = useStyles();
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(
    null
  );

  useEffect(() => {
    setContainerNode(
      document.querySelector<HTMLDivElement>('[data-vaul-drawer-wrapper]')
    );
  }, []);

  const isLeft = direction === 'left';
  const isRight = direction === 'right';
  const isHorizontal = isLeft || isRight;
  const isVertical = !isHorizontal;

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
        <div className={styles.handle} />
        <div className={clsx(styles.container)}>{children}</div>
      </>
    );
  };

  return (
    <Root
      open={open}
      onClose={onClose}
      dismissible={dismissible}
      direction={direction}
      onAnimationEnd={handleTeardown}
      disablePreventScroll={false}
    >
      <Portal container={containerNode}>
        <Content
          className={clsx({
            [styles.content]: true,
            [styles.contentVertical]: isVertical,
            [styles.contentHorizontal]: isHorizontal,
            [styles.contentLeft]: isHorizontal && isLeft,
            [styles.contentRight]: isHorizontal && isRight,
            [styles.contentFullscreen]: isFullscreen,
          })}
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
