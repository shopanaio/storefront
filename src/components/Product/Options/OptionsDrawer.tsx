import { Drawer } from "antd";
import { useIsMobile } from "@src/hooks/useIsMobile";

interface Props {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const OptionsDrawer = ({ open, onClose, children }: Props) => {
  const isMobile = useIsMobile();

  return (
    <Drawer
      placement={isMobile ? "bottom" : "right"}
      height={isMobile ? "60vh" : undefined}
      width={!isMobile ? "var(--components-drawer-width)" : undefined}
      open={open}
      onClose={onClose}
      closable={false}
      drawerRender={() => children}
    />
  );
};
