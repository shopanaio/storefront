'use client';

import { useState, useRef } from 'react';
import { Button, Flex } from 'antd';
import { Badge } from '@src/ui-kit/Badge';
import { TbFilter } from 'react-icons/tb';
import { createStyles } from 'antd-style';
import { ListingFilter } from '@src/templates/collection/blocks/ListingFilter';
import { useTranslations } from 'next-intl';
import { useActiveFiltersCount } from '@src/hooks/useActiveFiltersCount';
import { ApiFilter } from '@codegen/schema-client';
import { mq } from '@src/ui-kit/Theme/breakpoints';
import { DrawerBase } from '@src/ui-kit/DrawerBase';
import { useFiltersStore } from '@src/store/appStore';
import { StickyButton } from '@src/ui-kit/StickyButton';
import { useIsMobile } from '@src/hooks/useIsMobile';

interface FilterDrawerProps {
  filters: ApiFilter[];
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ filters }) => {
  const t = useTranslations('Listing');
  const { styles } = useStyles();
  const isMobile = useIsMobile();
  const applyFiltersRef = useRef<(() => void) | null>(null);
  const { selectedFilters, setSelectedFilters } = useFiltersStore();
  const [open, setOpen] = useState(false);

  const showDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);

  const { activeFiltersCount, hasActiveFilters } = useActiveFiltersCount({
    selectedFilters,
  });

  const handleReset = () => {
    if (hasActiveFilters) {
      // Reset in drawer should also apply immediately and close
      setSelectedFilters({});
      closeDrawer();
    }
  };

  const handleApplyFilters = () => {
    if (applyFiltersRef.current) {
      applyFiltersRef.current();
      closeDrawer();
    }
  };

  const onProvideApplyFunction = (applyFn: () => void) => {
    applyFiltersRef.current = applyFn;
  };

  const footerContent = (
    <StickyButton onClick={handleApplyFilters} label={t('apply-filters')} />
  );

  return (
    <>
      <Button
        className={styles.drawerBtn}
        icon={<TbFilter />}
        onClick={showDrawer}
      >
        {t('filters')}
        {hasActiveFilters && (
          <Badge variant="primary" count={activeFiltersCount} size="small" />
        )}
      </Button>
      <DrawerBase
        open={open}
        onClose={closeDrawer}
        footer={footerContent}
        engine={isMobile ? 'overlay' : 'vaul'}
        header={
          <DrawerBase.Header>
            <DrawerBase.Title>{t('filters')}</DrawerBase.Title>
            <Flex gap={8}>
              <Button onClick={handleReset}>{t('reset-all')}</Button>
              <DrawerBase.CloseButton />
            </Flex>
          </DrawerBase.Header>
        }
      >
        <ListingFilter
          filters={filters}
          mode="drawer"
          onProvideApplyFunction={onProvideApplyFunction}
        />
      </DrawerBase>
    </>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  drawerBtn: css`
    display: flex;
    justify-content: start;
    width: 100%;
    border-radius: ${token.borderRadius}px;
    border-color: ${token.colorBorder};

    ${mq.lg} {
      width: fit-content;
    }
  `,
  resetBtn: css`
    padding: 0;
  `,
  title: css`
    font-size: ${token.fontSizeLG}px;
    font-weight: 600;
    margin: 0;
  `,
}));
