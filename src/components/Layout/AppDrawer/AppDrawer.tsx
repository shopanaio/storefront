'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useModalStore } from '@src/store/appStore';
import { Divider, Flex, Button, Typography } from 'antd';
import { useLogo } from '@src/hooks/useLogo';
import { LanguageDropdown } from '../LanguageDropdown';
import { CurrencyDropdown } from '../CurrencyDropdown';
import { useTranslations } from 'next-intl';
import { createStyles } from 'antd-style';
import useToken from 'antd/es/theme/useToken';
import { DrawerBase } from '@src/components/UI/DrawerBase';
import { AppDrawerCartButton } from './AppDrawerCartButton';
import { AppDrawerWishlistButton } from './AppDrawerWishlistButton';
import { AppDrawerAccountButton } from './AppDrawerAccountButton';
import { AppDrawerSupportButton } from './AppDrawerSupportButton';

const { Text } = Typography;

export const AppDrawer: React.FC = () => {
  const isOpen = useModalStore((state) => state.isAppDrawerOpen);
  const setIsOpen = useModalStore((state) => state.setIsAppDrawerOpen);
  const pathname = usePathname();
  const t = useTranslations('Header');
  const { styles } = useStyles();
  const [, token] = useToken();
  const Logo = useLogo();

  const menuLinks = [
    { label: 'Link item 1', path: '/item1' },
    { label: 'Link item 2', path: '/item2' },
    { label: 'Link item 3', path: '/item3' },
    { label: 'Link item 4', path: '/item4' },
    { label: 'Link item 5', path: '/item5' },
  ];

  return (
    <DrawerBase
      placement="left"
      onClose={() => setIsOpen(false)}
      open={isOpen}
      width="var(--components-drawer-width)"
      contentClassName={styles.customDrawer}
      showCloseButton={false}
      title={<Logo size={32} />}
    >
      <Flex vertical>
        <AppDrawerCartButton />
        <AppDrawerWishlistButton />
        <AppDrawerAccountButton />
        <AppDrawerSupportButton />
      </Flex>

      <Divider className={styles.divider} />

      <Flex className={styles.menuSection} vertical>
        <Text type="secondary" className={styles.menuListTitle}>
          {t('menu-title')}
        </Text>

        {menuLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link key={link.path} href={link.path}>
              <Button
                type="text"
                className={styles.menuItem}
                style={{
                  color: isActive
                    ? 'var(--ant-color-primary)'
                    : 'var(--ant-color-text)',
                }}
              >
                {link.label}
              </Button>
            </Link>
          );
        })}
      </Flex>

      <Divider className={styles.divider} />

      <Flex className={styles.dropdownList} vertical align="start">
        <LanguageDropdown />
        <CurrencyDropdown />
      </Flex>
    </DrawerBase>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  customDrawer: css`
    padding: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${token.colorBgBase};
  `,
  header: css`
    background-color: var(--always-black-bg);
    gap: ${token.margin}px;
    padding: ${token.padding}px;

    border-radius: ${token.borderRadiusLG}px;
  `,

  closeBtn: css`
    color: ${token.colorTextLightSolid};
    &:hover {
      color: ${token.colorPrimary} !important;
    }
  `,

  linkButton: css`
    height: 46px;
    display: flex;
    justify-content: flex-start;
  `,

  menuSection: css`
    padding-top: ${token.padding}px;
    padding-bottom: ${token.paddingLG}px;
  `,
  menuListTitle: css`
    font-weight: ${token.fontWeightStrong};
    font-size: 12px;
    padding: 0 ${token.paddingMD}px;
    margin-bottom: ${token.marginXXS}px;
  `,
  menuItem: css`
    justify-content: flex-start;
    font-weight: var(--font-weight-400);
    font-size: 14px;

    color: ${token.colorTextBase};
    padding: ${token.paddingXS}px ${token.paddingMD}px;
    width: 100%;
    &:hover {
      color: ${token.colorPrimary} !important;
    }
  `,

  dropdownList: css`
    padding-top: ${token.paddingLG}px;
    padding-right: ${token.paddingMD}px;
    padding-left: ${token.paddingSM}px;
  `,

  divider: css`
    background-color: ${token.colorFillSecondary} !important;
    margin: ${token.marginSM}px 0;
  `,
}));
