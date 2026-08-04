'use client';

import { Divider, Flex } from 'antd';
import Link from '@shopana/storefront/next/link';
import { mq } from '@src/ui-kit/Theme/breakpoints';
import { useLogo } from '@src/hooks/useLogo';
import { CartButton } from './CartButton';
import { DesktopSearch } from '@src/templates/search/blocks/DesktopSearch';
import { createStyles } from 'antd-style';
import { SupportButton } from './SupportButton';
import { WishlistButton } from './WishlistButton';
import { AccountButton } from './AccountButton';
import { AppDrawerButton } from './AppDrawerButton';
import { useIsMobile } from '@src/hooks/useIsMobile';
import type { SectionProps } from '@shopana/storefront-sdk/core/types';
import type { HeaderSettings } from './HeaderSection.types';

export const Header: React.FC<SectionProps<HeaderSettings, null>> = ({
  settings,
}) => {
  const { styles } = useStyles(settings);
  const isMobile = useIsMobile();
  const Logo = useLogo();
  const showActions =
    settings.support.enabled ||
    settings.wishlist.enabled ||
    settings.account.enabled ||
    settings.cart.enabled;
  const showSupportDivider =
    settings.support.enabled &&
    (settings.wishlist.enabled ||
      settings.account.enabled ||
      settings.cart.enabled);

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        {settings.menu.enabled && (
          <AppDrawerButton
            size={settings.menu.iconSize}
            iconColor={settings.colors.icon}
          />
        )}
        {settings.logo.enabled && (
          <Link className={styles.logo} href="/">
            <Logo
              theme={settings.logo.theme}
              textColor={settings.colors.text}
              size={
                isMobile ? settings.logo.mobileSize : settings.logo.desktopSize
              }
            />
          </Link>
        )}
        {settings.search.enabled && (
          <DesktopSearch
            iconSize={settings.search.iconSize}
            iconColor={settings.colors.search.icon}
            showSubmitButton={settings.search.showSubmitButton}
            placeholder={settings.search.placeholder}
            submitLabel={settings.search.submitLabel}
          />
        )}
        {showActions && (
          <Flex className={styles.actions}>
            {settings.support.enabled && (
              <>
                <SupportButton
                  iconSize={settings.support.iconSize}
                  iconColor={settings.colors.icon}
                  phoneNumber={settings.support.phoneNumber}
                  href={settings.support.href}
                  showTextFrom={settings.support.showTextFrom}
                />
                {showSupportDivider && (
                  <Divider
                    className={styles.actionDivider}
                    orientation="vertical"
                  />
                )}
              </>
            )}
            {settings.wishlist.enabled && (
              <WishlistButton
                iconSize={settings.wishlist.iconSize}
                iconColor={settings.colors.icon}
                showTextFrom={settings.wishlist.showTextFrom}
              />
            )}
            {settings.account.enabled && (
              <AccountButton
                iconSize={settings.account.iconSize}
                iconColor={settings.colors.icon}
                showTextFrom={settings.account.showTextFrom}
              />
            )}
            {settings.cart.enabled && (
              <CartButton
                iconSize={settings.cart.iconSize}
                iconColor={settings.colors.icon}
                showTextFrom={settings.cart.showTextFrom}
              />
            )}
          </Flex>
        )}
      </div>
    </div>
  );
};

const useStyles = createStyles(({ token, css }, settings: HeaderSettings) => ({
  container: css`
    --components-header-control-height: ${settings.layout.controlHeight}px;
    --header-text-color: ${settings.colors.text};
    --header-control-background: ${settings.colors.control.background};
    --header-control-hover-background: ${settings.colors.control
      .hoverBackground};
    --header-search-background: ${settings.colors.search.background};
    --header-search-border: ${settings.colors.search.border};
    --header-search-text: ${settings.colors.search.text};
    --header-search-placeholder: ${settings.colors.search.placeholder};
    --header-primary-button-background: ${settings.colors.primaryButton
      .background};
    --header-primary-button-text: ${settings.colors.primaryButton.text};
    --header-badge-background: ${settings.colors.badge.background};
    --header-badge-text: ${settings.colors.badge.text};

    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: ${token.paddingSM}px;
    color: var(--header-text-color);
    background-color: ${settings.colors.background};
    border-bottom: 1px solid ${settings.colors.border};
    box-shadow: ${settings.layout.showShadow
      ? token.boxShadowTertiary
      : 'none'};
    position: ${settings.layout.sticky ? 'sticky' : 'relative'};
    top: 0;
    z-index: 20;

    ${mq.lg} {
      padding: ${token.paddingSM}px ${token.padding}px;
    }
  `,
  inner: css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    gap: ${token.marginSM}px;

    ${mq.md} {
      column-gap: ${token.margin}px;
    }

    ${mq.xl} {
      margin: 0 auto;
      max-width: ${settings.layout.maxWidth.xl}px;
    }

    ${mq.xxl} {
      max-width: ${settings.layout.maxWidth.xxl}px;
    }
  `,
  logo: css`
    flex-grow: 1;
    display: flex;
    align-items: center;

    ${mq.lg} {
      flex-grow: unset;
      padding-right: ${token.padding}px;
    }
  `,
  actions: css`
    order: 3;
    justify-content: flex-end;
    align-items: center;
    gap: ${token.marginXXS}px;

    ${mq.lg} {
      order: 4;
      min-width: max-content;
    }
  `,
  actionDivider: css`
    display: none;
    height: 32px;
    margin-inline: 4px;
    border-color: ${settings.colors.divider};

    ${mq.xl} {
      display: block;
    }
  `,
}));
