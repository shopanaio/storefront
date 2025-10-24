import { Drawer } from 'antd';
import {
  cloneElement,
  ReactElement,
  ReactNode,
} from 'react';
import {
  createStyles,
} from 'antd-style';
import useBodyScrollLock from '@src/components/UI/hooks/useBodyScrollLock';
import useViewportMetrics from '@src/components/UI/hooks/useViewportMetrics';

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

  const drawerRef = useBodyScrollLock<HTMLDivElement>(open);

  const {
    viewport: { height },
  } = useViewportMetrics();

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
