"use client";

import { Checkbox, Flex, Radio } from "antd";
import { createStyles } from "antd-style";
import { useCallback, useMemo, useState } from "react";
import { OptionsDrawer } from "./OptionsDrawer";
import { OptionDrawerLayout } from "./DrawerLayout";
import { DrawerGrid } from "./DrawerGrid";
import type * as Entity from "@src/entity/namespace";
import { OptionHeader } from "./Header";
import { getGroupItemPrice } from "@src/utils/getGroupItemPrice";
import { UiOptionValue } from "@src/hooks/useFlattenProductOptions";
import { OptionProductCard } from "@src/components/Product/Options/OptionProductCard";
import { OptionSelectCard } from "@src/components/Product/Options/OptionSelectCard";
import { Thumbnail } from "@src/components/UI/Thumbnail/Thumbnail";

interface ComponentOptionProps {
  multiple: boolean;
  pageTitle: string;
  options: Entity.ProductGroupItem[];
  selectedIds?: string[];
  onChange: (id: string) => void;
  displayType: Entity.ProductOptionDisplayType;
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
    const mapToUiOptionValue = (item: ApiProductGroupItem): UiOptionValue => ({
      id: item.product.id,
      handle: item.product.handle || item.product.id,
      iid: item.product.id,
      title: item.product.title,
      // No swatch and variant for group products
      swatch: undefined,
      isActive: selectedIds?.includes(item.product.id) ?? false,
      variant: undefined,
      amount: getGroupItemPrice(item),
    });

    if (multiple) {
      const list = options
        .filter((opt) => selectedIds?.includes(opt.product.id))
        .map(mapToUiOptionValue);
      return list;
    }

    const found = options.find((opt) => opt.product.id === selectedIds?.[0]);
    return found ? mapToUiOptionValue(found) : null;
  }, [multiple, options, selectedIds]);

  /* Selected cover to display (from selected product) */
  const selectedCover = useMemo(() => {
    if (!selectedIds || selectedIds.length === 0) {
      return options[0]?.product.cover;
    }

    if (multiple) {
      // For multiple selection take cover of first selected
      const firstSelectedId = selectedIds[0];
      const found = options.find((opt) => opt.product.id === firstSelectedId);
      return found?.product.cover || options[0]?.product.cover;
    }

    // For single selection
    const found = options.find((opt) => opt.product.id === selectedIds[0]);
    return found?.product.cover || options[0]?.product.cover;
  }, [multiple, options, selectedIds]);

  /* Selected titles for drawer footer (uses internal draft state) */
  const selectedTitlesForDrawer = useMemo(() => {
    if (multiple) {
      return options
        .filter((opt) => draftSelectedIds.includes(opt.product.id))
        .map((opt) => opt.product.title);
    }
    const found = options.find((opt) => opt.product.id === draftSelectedIds[0]);
    return found ? found.product.title : "";
  }, [multiple, draftSelectedIds, options]);

  const renderOption = (item: ApiProductGroupItem, inDrawer: boolean) => {
    const isSelected = inDrawer
      ? draftSelectedIds.includes(item.product.id)
      : selectedIds?.includes(item.product.id) ?? false;

    const handleClick = () => {
      if (inDrawer) {
        if (multiple) {
          setDraftSelectedIds((prev) =>
            prev.includes(item.product.id)
              ? prev.filter((id) => id !== item.product.id)
              : [...prev, item.product.id]
          );
        } else {
          setDraftSelectedIds([item.product.id]);
        }
      } else {
        onChange(item.product.id);
      }
    };

    if (inDrawer) {
      return (
        <OptionProductCard
          key={item.product.id}
          src={item.product?.cover?.url}
          alt={item.product?.title || ""}
          title={item.product.title}
          price={getGroupItemPrice(item)}
          selected={isSelected}
          onClick={handleClick}
          control={multiple ? "checkbox" : "radio"}
        />
      );
    }

    return (
      <Thumbnail
        key={item.product.id}
        src={item.product?.cover?.url}
        alt={item.product?.title ?? "Untitled"}
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
      <OptionsDrawer open={open} onClose={handleCancel}>
        <OptionDrawerLayout
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
      </OptionsDrawer>
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
