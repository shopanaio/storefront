'use client';

import { createStyles } from 'antd-style';
import type { ReactNode } from 'react';
import { CardHeader } from './Headers';

/** A store card on a page of its own: the logo over the screen, 440px wide at most. */
export const AuthCard = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { styles, cx } = useStyles();
  return (
    <div className={cx(styles.card, className)}>
      <CardHeader canGoBack={false} back={() => undefined} />
      {children}
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    display: flex;
    flex-direction: column;
    gap: ${token.paddingLG + 4}px;
    width: 100%;
    max-width: 440px;
    margin: 0 auto;
    padding: ${token.paddingLG + 4}px ${token.paddingXL + 4}px ${token.paddingXL}px;
    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadiusLG}px;
  `,
}));
