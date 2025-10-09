import { DrawerBase } from "@src/components/UI/DrawerBase";

interface Props {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const OptionsDrawer = ({ open, onClose, children }: Props) => {
  return (
    <DrawerBase open={open} onClose={onClose} showCloseButton={false}>
      {children}
    </DrawerBase>
  );
};
