import useViewportMetrics from '@src/components/UI/hooks/useViewportMetrics';
import { Drawer } from 'antd';
import {
  cloneElement,
  ReactElement,
  ReactNode,
  useLayoutEffect,
  useRef,
} from 'react';
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from 'body-scroll-lock';
import { createStyles } from 'antd-style';

export interface OverlayProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Overlay = ({
  open,
  onClose,
  children,
  ...drawerProps
}: OverlayProps) => {
  const { styles } = useStyles();

  const drawerRef = useRef<HTMLDivElement>(null);

  const {
    viewport: { height },
  } = useViewportMetrics();

  useLayoutEffect(() => {
    if (!drawerRef.current) {
      return;
    }

    if (open) {
      disableBodyScroll(drawerRef.current);
    } else {
      enableBodyScroll(drawerRef.current);
    }

    return () => {
      clearAllBodyScrollLocks();
    };
  }, [open]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="top"
      height="100dvh"
      width="100dvw"
      mask={false}
      closable={false}
      forceRender
      styles={{
        mask: {
          display: 'none',
        },
        wrapper: {
          overscrollBehavior: 'none',
          transition: 'none',
        },
      }}
      drawerRender={(node) =>
        cloneElement(
          node as ReactElement,
          {},
          <div
            ref={drawerRef}
            style={{
              maxHeight: height,
              overflow: 'hidden',
            }}
            className={styles.content}
          >
            {children}
          </div>
        )
      }
      {...drawerProps}
      // @ts-expect-error This prop exists
      motion={false}
    >
      {children}
    </Drawer>
  );
};

const useStyles = createStyles(({ css }) => ({
  content: css`
    &,
    & * {
      overscroll-behavior: none;
    }
  `,
}));
