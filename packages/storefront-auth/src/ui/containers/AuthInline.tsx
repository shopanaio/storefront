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
  // The side padding of the checkout blocks (an open method panel), so it sits among them;
  // more room above and below the form.
  panel: css`
    display: flex;
    flex-direction: column;
    gap: ${token.paddingSM}px;
    padding: ${token.paddingLG}px ${token.paddingSM}px;
    border: ${token.lineWidth}px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
  `,
}));
