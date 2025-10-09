import React, { useEffect, useMemo, useState } from 'react';
import {
  useStyles,
  DRAWER_CONTENT_OFFSET_TOP,
} from './styles';
import { Portal, Root, Content, Overlay } from 'vaul';

export interface DrawerProps {
  container?: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  dismissible: boolean;
  children: React.ReactNode;
}

function Drawer({
  container,
  open,
  onClose,
  dismissible,
  children,
}: DrawerProps & React.HTMLAttributes<HTMLDivElement>) {
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
    }),
    [height],
  );

  return (
    <Root
      autoFocus
      container={container}
      open={open}
      onClose={onClose}
      dismissible={dismissible}
      repositionInputs
    >
      <Portal>
        <Content className={styles.content} >
          <div className={styles.handle} />
          <div className={styles.container} style={style} >
            <div ref={setContainerEl}>{children}</div>
          </div>
        </Content>
        <Overlay  />
      </Portal>
    </Root>
  );
}

export default Drawer;
