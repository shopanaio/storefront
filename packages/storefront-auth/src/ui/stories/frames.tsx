import { createStyles } from 'antd-style';
import type { ReactNode } from 'react';
import { ScreenPresetContext, type ScreenPreset } from '../common/preset';
import {
  AuthDrawerSurface,
  AuthCardSurface,
  AuthInlineSurface,
} from '../containers/surfaces';
import { AuthIntlProvider } from '../i18n/AuthIntlProvider';
import type { AuthContext } from '../screens/types';

/** Stories open in Ukrainian, the language of the boards; the toolbar switches it. */
export const BOARD_GLOBALS = { locale: 'uk' };

const noop = () => undefined;

/**
 * Where a board shows the screen, in the containers of the package: a store card, the checkout
 * drawer, or inline in the checkout. `preset` is what the board shows typed in. A theme's
 * Storybook wraps it in its own providers (antd `ConfigProvider`, `AuthUIProvider`).
 */
export const Frame = ({
  context,
  back,
  preset = {},
  children,
  width,
}: {
  context: AuthContext | 'page' | 'profile';
  /** The screen has a way back in its header. */
  back?: boolean;
  preset?: ScreenPreset;
  children: ReactNode;
  width?: number;
}) => (
  <AuthIntlProvider>
    <ScreenPresetContext.Provider value={preset}>
      <FrameBox context={context} back={back} width={width}>
        {children}
      </FrameBox>
    </ScreenPresetContext.Provider>
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
  switch (context) {
    case 'profile':
      return (
        <div className={styles.profile} style={{ width: width ?? 720 }}>
          {children}
        </div>
      );
    case 'checkoutGuest':
      // The checkout drawer itself, open over the story: its header carries the screen's title.
      return (
        <AuthDrawerSurface open onClose={noop} width={width}>
          {children}
        </AuthDrawerSurface>
      );
    case 'checkoutRequired':
      return (
        <AuthInlineSurface
          className={styles.font}
          style={{ width: width ?? 656 }}
        >
          {children}
        </AuthInlineSurface>
      );
    default:
      return (
        <AuthCardSurface
          onBack={back && context === 'store' ? noop : undefined}
          className={styles.card}
          style={{ width: width ?? 440 }}
        >
          {children}
        </AuthCardSurface>
      );
  }
};

const useStyles = createStyles(({ css, token }) => ({
  // A card of the board: as tall as the tallest screen, over the canvas.
  card: css`
    min-height: 560px;
    box-shadow: ${token.boxShadowTertiary};
    font-family: ${token.fontFamily};
  `,
  font: css`
    font-family: ${token.fontFamily};
  `,
  profile: css`
    box-sizing: border-box;
    padding: ${token.paddingXL}px;
    background: ${token.colorBgContainer};
    font-family: ${token.fontFamily};
  `,
}));
