'use client';

import { createStyles } from 'antd-style';
import { AuthFlow, type AuthFlowProps } from '../flow/AuthFlow';

export interface AuthInlineProps extends Omit<AuthFlowProps, 'context' | 'renderHeader'> {
  /** `checkoutRequired` by default: the checkout of a store that takes orders from accounts only. */
  context?: AuthFlowProps['context'];
  className?: string;
}

/** Sign-in in the page itself, in a panel; the screens bring their own ways back. */
export const AuthInline = ({
  context = 'checkoutRequired',
  className,
  ...flowProps
}: AuthInlineProps) => {
  const { styles, cx } = useStyles();
  return (
    <div className={cx(styles.panel, className)}>
      <AuthFlow {...flowProps} context={context} />
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  panel: css`
    display: flex;
    flex-direction: column;
    gap: ${token.paddingSM}px;
    padding: ${token.paddingXL}px ${token.paddingLG}px;
    border: ${token.lineWidth}px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
  `,
}));
