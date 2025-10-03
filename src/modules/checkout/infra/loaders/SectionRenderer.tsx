'use client';

import { Flex, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import {
  sectionRegistry,
  SectionSlug,
  SectionModuleApi,
} from '../../sections/registry';
import { DynamicRenderer } from './DynamicRenderer';
import { createStyles } from 'antd-style';
import { SectionTitle } from '@src/modules/checkout/components/common/SectionTitle';

interface Prop {
  slug: SectionSlug;
  /** Optional action component to render next to the section title */
  headerAction?: React.ReactNode;
}

/**
 * Renders a checkout section by slug using the section registry.
 * Wraps DynamicRenderer with section-specific logic.
 */
export const SectionRenderer = ({ slug, headerAction }: Prop) => {
  const t = useTranslations('Checkout');
  const loader = sectionRegistry.resolve(slug);

  // Memoize getComponent to prevent component remounting on every render
  const getComponent = useMemo(() => {
    return (api: SectionModuleApi) => {
      const { Component, titleKey } = api;

      return (props: any) => (
        <Flex vertical gap={12}>
          <Flex justify="space-between" align="center">
            <SectionTitle>{t(titleKey)}</SectionTitle>
            {headerAction}
          </Flex>
          <Component {...props} />
        </Flex>
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DynamicRenderer
      loader={loader}
      getComponent={getComponent}
      componentProps={{}}
    />
  );
};

const useStyles = createStyles(({ css, token }) => ({
  title: css`
    font-size: ${token.fontSizeXL}px;
  `,
}));

export default SectionRenderer;
