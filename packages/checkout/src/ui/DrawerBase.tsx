'use client';

import { Button, Drawer, Flex, Typography } from 'antd';
import type { ButtonProps, DrawerProps, FlexProps } from 'antd';
import { createStyles } from 'antd-style';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { useIsMobile } from './useIsMobile';

type DrawerEngine = 'antd' | 'overlay' | 'vaul';
export interface DrawerBaseProps
  extends Omit<DrawerProps, 'children' | 'onClose' | 'open'> {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  minHeight?: string | number;
  engine?: DrawerEngine;
}

const CloseContext = createContext<() => void>(() => undefined);

export function DrawerBase({
  open,
  onClose,
  children,
  header,
  footer,
  minHeight,
  placement,
  engine: _engine,
  ...props
}: DrawerBaseProps) {
  const mobile = useIsMobile();
  const { styles } = useStyles();
  return (
    <CloseContext.Provider value={onClose}>
      <Drawer
        open={open}
        onClose={onClose}
        placement={placement ?? (mobile ? 'bottom' : 'right')}
        height={mobile ? minHeight ?? '80dvh' : undefined}
        closable={false}
        title={header}
        footer={footer}
        styles={{ body: { padding: 0 } }}
        {...props}
      >
        <div className={styles.content}>{children}</div>
      </Drawer>
    </CloseContext.Provider>
  );
}

function Header(props: FlexProps) {
  return <Flex {...props} />;
}

function Title({ children, id }: { children: ReactNode; id?: string }) {
  return <Typography.Text id={id} strong>{children}</Typography.Text>;
}

function CloseButton(props: ButtonProps) {
  const close = useContext(CloseContext);
  return <Button type="text" icon={<RxCross2 size={24} />} onClick={close} {...props} />;
}

DrawerBase.Header = Header;
DrawerBase.Title = Title;
DrawerBase.CloseButton = CloseButton;

const useStyles = createStyles(({ css, token }) => ({
  content: css`
    height: 100%;
    overflow: auto;
    padding: ${token.paddingSM}px;
  `,
}));
