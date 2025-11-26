'use client';

import { Checkbox, Flex, Radio } from 'antd';
import { createStyles } from 'antd-style';
import { useCallback, useMemo, useState } from 'react';
import { OptionDrawerLayout } from './DrawerLayout';
import { DrawerGrid } from './DrawerGrid';
import type { model } from "@shopana/storefront-sdk";
import { OptionHeader } from './OptionHeader';
import { getGroupItemPrice } from '@src/utils/getGroupItemPrice';
import { UiOptionValue } from '@src/hooks/useFlattenProductOptions';
import { OptionProductCard } from './OptionProductCard';
import { OptionSelectCard } from './OptionSelectCard';
import { Thumbnail } from '@src/ui-kit/Thumbnail/Thumbnail';
import { ProductOptionDisplayType } from '@codegen/schema-client';

interface ComponentOptionProps {
  multiple: boolean;
  pageTitle: string;
  options: model.ProductGroupItem[];
  selectedIds?: string[];
  onChange: (id: string) => void;
  displayType: model.ProductOptionDisplayType;
}

export const ComponentOption = ({
  multiple,
  pageTitle,
  options,
  selectedIds,
  onChange,
  displayType,
}: ComponentOptionProps) => {
  const { styles } = useStyles();
  /* Drawer visibility */
  const [open, setOpen] = useState(false);

  /* Internal state for selections made inside the drawer */
  const [draftSelectedIds, setDraftSelectedIds] = useState<string[]>(
    selectedIds ?? []
  );

  /* Open drawer and sync internal state with currently selected ids */
  const showDrawer = useCallback(() => {
    setDraftSelectedIds(selectedIds ?? []);
    setOpen(true);
  }, [selectedIds]);

  /* Confirm selections, propagate changes to parent and close drawer */
  const handleConfirm = useCallback(() => {
    setOpen(false);

    if (multiple) {
      const prev = selectedIds ?? [];
      const added = draftSelectedIds.filter((id) => !prev.includes(id));
      const removed = prev.filter((id) => !draftSelectedIds.includes(id));
      [...added, ...removed].forEach((id) => onChange(id));
    } else {
      const newId = draftSelectedIds[0];
      if (newId && newId !== selectedIds?.[0]) {
        onChange(newId);
      }
    }
  }, [multiple, draftSelectedIds, selectedIds, onChange]);

  /* Close drawer without applying changes */
  const handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  /* Selected values to display on the page (uses props) */
  const selectedValues = useMemo<UiOptionValue | UiOptionValue[] | null>(() => {
    const mapToUiOptionValue = (
      item: model.ProductGroupItem
    ): UiOptionValue => ({
      id: item.node.id,
      handle: item.node.handle || item.node.id,
      title: item.node.title,
      // No swatch and variant for group products
      swatch: undefined,
      isActive: selectedIds?.includes(item.node.id) ?? false,
      variant: undefined,
      amount: getGroupItemPrice(item),
    });

    if (multiple) {
      const list = options
        .filter((opt) => selectedIds?.includes(opt.node.id))
        .map(mapToUiOptionValue);
      return list;
    }

    const found = options.find((opt) => opt.node.id === selectedIds?.[0]);
    return found ? mapToUiOptionValue(found) : null;
  }, [multiple, options, selectedIds]);

  /* Selected cover to display (from selected product) */
  const selectedCover = useMemo(() => {
    if (!selectedIds || selectedIds.length === 0) {
      return options[0]?.node.cover;
    }

    if (multiple) {
      // For multiple selection take cover of first selected
      const firstSelectedId = selectedIds[0];
      const found = options.find((opt) => opt.node.id === firstSelectedId);
      return found?.node.cover || options[0]?.node.cover;
    }

    // For single selection
    const found = options.find((opt) => opt.node.id === selectedIds[0]);
    return found?.node.cover || options[0]?.node.cover;
  }, [multiple, options, selectedIds]);

  /* Selected titles for drawer footer (uses internal draft state) */
  const selectedTitlesForDrawer = useMemo(() => {
    if (multiple) {
      return options
        .filter((opt) => draftSelectedIds.includes(opt.node.id))
        .map((opt) => opt.node.title);
    }
    const found = options.find((opt) => opt.node.id === draftSelectedIds[0]);
    return found ? found.node.title : '';
  }, [multiple, draftSelectedIds, options]);

  const renderOption = (item: model.ProductGroupItem, inDrawer: boolean) => {
    const isSelected = inDrawer
      ? draftSelectedIds.includes(item.node.id)
      : (selectedIds?.includes(item.node.id) ?? false);

    const handleClick = () => {
      if (inDrawer) {
        if (multiple) {
          setDraftSelectedIds((prev) =>
            prev.includes(item.node.id)
              ? prev.filter((id) => id !== item.node.id)
              : [...prev, item.node.id]
          );
        } else {
          setDraftSelectedIds([item.node.id]);
        }
      } else {
        onChange(item.node.id);
      }
    };

    if (inDrawer) {
      return (
        <OptionProductCard
          key={item.node.id}
          src={item.node?.cover?.url}
          alt={item.node?.title || ''}
          title={item.node.title}
          price={getGroupItemPrice(item)}
          selected={isSelected}
          onClick={handleClick}
          control={multiple ? 'checkbox' : 'radio'}
        />
      );
    }

    return (
      <Thumbnail
        key={item.node.id}
        src={item.node?.cover?.url}
        alt={item.node?.title ?? 'Untitled'}
        selected={isSelected}
        onClick={handleClick}
        overlay={
          inDrawer ? (
            multiple ? (
              <Checkbox checked={isSelected} />
            ) : (
              <Radio checked={isSelected} />
            )
          ) : undefined
        }
      />
    );
  };

  return (
    <>
      <Flex vertical gap={16}>
        {displayType === ProductOptionDisplayType.Dropdown ? (
          <>
            <OptionSelectCard
              title={pageTitle}
              selectedValues={selectedValues}
              cover={selectedCover}
              onClick={showDrawer}
            />
          </>
        ) : (
          <>
            <OptionHeader
              title={pageTitle}
              value={selectedValues}
              onClick={showDrawer}
            />
            <div className={styles.variantsGrid}>
              {options.map((item) => renderOption(item, false))}
            </div>
          </>
        )}
      </Flex>
      <OptionDrawerLayout
        open={open}
        title={pageTitle}
        onClose={handleCancel}
        footer={{
          selectedLabel: selectedTitlesForDrawer,
          onConfirm: handleConfirm,
        }}
      >
        <DrawerGrid columns={1}>
          {options.map((item) => renderOption(item, true))}
        </DrawerGrid>
      </OptionDrawerLayout>
    </>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  variantsGrid: css`
    display: grid;
    grid-template-columns: repeat(
      auto-fill,
      minmax(var(--thumb-size, 74px), 1fr)
    );
    gap: ${token.marginXS}px;
  `,
}));
