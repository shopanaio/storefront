import { createStyles } from 'antd-style';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthHeadingContext, type AuthHeading } from '../common/Screen';
import { AuthIntlProvider } from '../i18n/AuthIntlProvider';
import { DrawerBase } from '@shopana/storefront-ui';
import { CardHeader } from '../containers/Headers';
import type { AuthContext } from '../screens/types';

/** Stories open in Ukrainian, the language of the boards; the toolbar switches it. */
export const BOARD_GLOBALS = { locale: 'uk' };

/**
 * Where a board shows the screen: a store card, the checkout drawer, or inline in the checkout.
 * A theme's Storybook wraps it in its own providers (antd `ConfigProvider`, `AuthUIProvider`).
 */
export const Frame = ({
  context,
  back,
  children,
  width,
}: {
  context: AuthContext | 'page' | 'profile';
  /** The screen has a way back in its header. */
  back?: boolean;
  children: ReactNode;
  width?: number;
}) => (
  <AuthIntlProvider>
    <FrameBox context={context} back={back} width={width}>
      {children}
    </FrameBox>
  </AuthIntlProvider>
);

const FrameBox = ({
  context,
  back,
  width,
  children,
}: {
  context: AuthContext | 'page' | 'profile';
  back?: boolean;
  width?: number;
  children: ReactNode;
}) => {
  const { styles } = useStyles();
  const [heading, setHeading] = useState<AuthHeading | null>(null);
  const noop = () => undefined;
  if (context === 'profile') {
    return (
      <div className={styles.profile} style={{ width: width ?? 720 }}>
        {children}
      </div>
    );
  }
  if (context === 'checkoutGuest') {
    // The checkout drawer itself, open over the story: its header carries the screen's title.
    return (
      <DrawerBase open onClose={noop} title={heading?.title} width={width}>
        <AuthHeadingContext.Provider value={setHeading}>{children}</AuthHeadingContext.Provider>
      </DrawerBase>
    );
  }
  if (context === 'checkoutRequired') {
    return (
      <div className={styles.inline} style={{ width: width ?? 656 }}>
        {children}
      </div>
    );
  }
  return (
    <div className={styles.card} style={{ width: width ?? 440 }}>
      <CardHeader canGoBack={Boolean(back) && context === 'store'} back={noop} />
      {children}
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: ${token.paddingLG + 4}px;
    min-height: 560px;
    padding: ${token.paddingLG + 4}px ${token.paddingXL + 4}px ${token.paddingXL}px;
    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadiusLG}px;
    box-shadow: ${token.boxShadowTertiary};
    font-family: ${token.fontFamily};
  `,
  profile: css`
    box-sizing: border-box;
    padding: ${token.paddingXL}px;
    background: ${token.colorBgContainer};
    font-family: ${token.fontFamily};
  `,
  inline: css`
    box-sizing: border-box;
    padding: ${token.paddingXL}px ${token.paddingLG}px;
    border: ${token.lineWidth}px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
    font-family: ${token.fontFamily};
  `,
}));
