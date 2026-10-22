'use client';

import { Modal } from 'antd';
import { createStyles } from 'antd-style';
import type { ReactNode } from 'react';
import { breakpoints } from './breakpoints';
import { useMediaQuery } from './useMediaQuery';
import { Vaul } from './drawer/Vaul';

export interface ResponsiveDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called after the closing animation, when the content is gone. */
  onExited?: () => void;
  children: ReactNode;
  /** Width of the dialog on desktop; 440px by default. */
  width?: number;
  /** Shows the close button of the dialog on desktop; a sheet closes by dragging it down. */
  closable?: boolean;
  /** Names the sheet on a phone; the modal is named by its content heading. */
  'aria-labelledby'?: string;
  className?: string;
}

/** Below `md` the dialog is a bottom sheet. */
const PHONE_QUERY = `(max-width: ${breakpoints.md - 0.05}px)`;

export const useIsPhone = () => useMediaQuery(PHONE_QUERY);

/**
 * A dialog that fits the screen: an antd `Modal` on desktop and a vaul bottom sheet on a phone
 * (narrower than 768px), the content the same in both.
 */
export const ResponsiveDialog = ({
  open,
  onClose,
  onExited,
  children,
  width = 440,
  closable = true,
  'aria-labelledby': ariaLabelledBy,
  className,
}: ResponsiveDialogProps) => {
  const { styles, cx } = useStyles();
  const isPhone = useIsPhone();

  if (isPhone) {
    return (
      <Vaul
        open={open}
        onClose={onClose}
        onExited={onExited}
        dismissible
        direction="bottom"
        aria-labelledby={ariaLabelledBy}
      >
        <div className={cx(styles.sheet, className)}>{children}</div>
      </Vaul>
    );
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={onExited}
      footer={null}
      centered
      width={width}
      closable={closable}
      destroyOnHidden
      className={className}
    >
      {children}
    </Modal>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  sheet: css`
    max-height: 90dvh;
    overflow-y: auto;
    padding: ${token.paddingSM}px ${token.padding}px
      calc(${token.paddingLG}px + var(--safe-area-bottom, 0px));
  `,
}));
