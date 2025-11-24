'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Flex, Divider, Typography } from 'antd';
import { ComponentOption } from '@src/components/Product/Options/OptionComponent';
import { ProductCollapse } from '@src/components/Product/ProductCollapse';
import { ProductOptionDisplayType } from '@codegen/schema-client';
import { useProductGroups as usePartitionGroups } from '@src/hooks/useProductGroups';
import { useProductGroups as useGroupsLogic } from '@src/hooks/product/useProductGroups';
import { useTranslations } from 'next-intl';
import { createStyles } from 'antd-style';
import { IncludedComponent } from '@src/components/Product/Options/IncludedComponent';
import { model } from '@shopana/storefront-sdk';

const { Text } = Typography;

interface ProductGroupsProps {
  product: model.Product;
}

export const ProductComponents = ({ product }: ProductGroupsProps) => {
  const t = useTranslations('Product');
  const { styles } = useStyles();

  const { multiple: multiItemGroups, single: singleItemGroups } =
    usePartitionGroups(product.groups);

  const groups = useGroupsLogic(product, product.variants[0]);

  const selectedGroupMap = useMemo(() => {
    const map = new Map<string, { id: string; items: string[] }>();
    for (const [groupId, items] of Object.entries(groups.selectionsByGroupId)) {
      map.set(groupId, { id: groupId, items: items.map((x) => x.purchasableId) });
    }
    return map;
  }, [groups.selectionsByGroupId]);

  const handleChange = useCallback(
    (group: model.ProductGroup, newProductId: string) => {
      groups.toggleItem(group.id, newProductId, group.isMultiple);
    },
    [groups]
  );

  return (
    <>
      <Text className={styles.title}>{t('select-accessories')}</Text>
      {multiItemGroups.map((group, index, { length }) => {
        const selectedGroup = selectedGroupMap.get(group.id);
        const selectedIds = selectedGroup?.items ?? [];

        return (
          <React.Fragment key={group.id}>
            <ComponentOption
              multiple={group.isMultiple}
              pageTitle={group.title}
              options={group.items}
              selectedIds={selectedIds}
              onChange={(newProductId) => handleChange(group, newProductId)}
              displayType={
                index === 0 && length > 1 && !group.isMultiple
                  ? ProductOptionDisplayType.Dropdown
                  : ProductOptionDisplayType.Radio
              }
            />
            {index !== length - 1 && <Divider className={styles.divider} />}
          </React.Fragment>
        );
      })}
      {singleItemGroups.length !== 0 && (
        <ProductCollapse
          title={<Text className={styles.title}>{t('what-included')}</Text>}
          panelKey={t('what-included-box-key')}
          dense
        >
          <Flex vertical gap={8} style={{ padding: 0, margin: 0 }}>
            {singleItemGroups.map((group, index) => (
              <IncludedComponent key={index} option={group.items[0].node} />
            ))}
          </Flex>
        </ProductCollapse>
      )}
    </>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: ${token.paddingSM}px;
    border-radius: ${token.borderRadiusLG}px;
    border: 1px solid ${token.colorBorderSecondary};
  `,
  divider: css`
    margin-top: 0;
    margin-bottom: 0;
  `,
  title: css`
    font-size: ${token.fontSizeLG}px;
    font-weight: 600;
  `,
}));
