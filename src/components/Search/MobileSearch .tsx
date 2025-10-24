'use client';

import React, { useEffect, useRef } from 'react';
import { Flex, Input, Typography } from 'antd';
import { TbSearch } from 'react-icons/tb';
import type { InputRef } from 'antd';
import SearchResults from './SearchResults';
import { useTranslations } from 'next-intl';
import { createStyles } from 'antd-style';
import { useSearchInput } from '@src/hooks/useSearchInput';
import { useModalStore } from '@src/store/appStore';
import { DrawerBase } from '@src/components/UI/DrawerBase';
import { StickyButton } from '@src/components/UI/StickyButton/StickyButton';
import usePredictiveSearch from '@src/hooks/search/usePredictiveSearch';
import { useSearchAllButton } from '@src/hooks/useSearchAllButton';

export const MobileSearch: React.FC = () => {
  const t = useTranslations('Header');
  const { styles } = useStyles();
  const inputRef = useRef<InputRef>(null);
  const isOpen = useModalStore((state) => state.searchDialogOpen);
  const setIsOpen = useModalStore((state) => state.setSearchDialogOpen);
  const { searchTerm, setSearchTerm, debouncedTerm } = useSearchInput('', 300);

  // Get search results for footer button
  const { products } = usePredictiveSearch(debouncedTerm);

  // Get search all button props
  const { href, label } = useSearchAllButton(debouncedTerm);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else if (!isOpen) {
      // Reset search term when drawer is closed
      setSearchTerm('');
    }
  }, [isOpen, setSearchTerm]);

  // Create footer with StickyButton when there are search results
  const shouldShowFooterButton =
    debouncedTerm.trim() !== '' && products.length > 0;
  const footer = shouldShowFooterButton ? (
    <StickyButton
      variant="outlined"
      color="default"
      href={href}
      label={label}
    />
  ) : undefined;

  return (
    <DrawerBase
      open={isOpen}
      onClose={() => setIsOpen(false)}
      width="var(--components-drawer-width)"
      // @ts-expect-error Todo: change button UI
      footer={null && footer}
      placement="left"
      engine="overlay"
      showCloseButton
      header={
        <DrawerBase.Header vertical gap={8} align="flex-start">
          <Flex justify="space-between" align="center" style={{ width: '100%' }}>
            <DrawerBase.Title>{t('search')}</DrawerBase.Title>
            <DrawerBase.CloseButton onClick={() => setIsOpen(false)} />
          </Flex>
          <Input
            allowClear
            className={styles.input}
            ref={inputRef}
            placeholder={`${t('search')} ...`}
            prefix={<TbSearch className={styles.searchIcon} size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </DrawerBase.Header>
      }
    >
      <div data-testid="mobile-search-drawer">
        <SearchResults searchTerm={debouncedTerm} />
      </div>
    </DrawerBase>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    input: css`
      display: flex;
      width: 100%;
      height: 40px;
      padding: ${token.paddingXS}px ${token.paddingSM}px;
    `,
    searchIcon: css`
      color: ${token.colorTextPlaceholder};
    `,
  };
});
