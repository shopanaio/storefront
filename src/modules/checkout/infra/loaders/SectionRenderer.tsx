'use client';

import { Flex, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { sectionRegistry, SectionSlug, SectionModuleApi } from '../../sections/registry';
import { DynamicRenderer } from './DynamicRenderer';

interface Prop {
  slug: SectionSlug;
  country: 'UA' | 'INTL';
}

/**
 * Renders a checkout section by slug using the section registry.
 * Wraps DynamicRenderer with section-specific logic.
 */
export const SectionRenderer = ({ slug, country }: Prop) => {
  const t = useTranslations('Checkout');
  const loader = sectionRegistry.resolve(slug);

  return (
    <DynamicRenderer
      loader={loader}
      getComponent={(api: SectionModuleApi) => {
        const { Component, titleKey } = api;
        // Wrap component with title
        return (props) => (
          <Flex vertical gap={12}>
            <Typography.Text strong>{t(titleKey)}</Typography.Text>
            <Component {...props} />
          </Flex>
        );
      }}
      componentProps={{ country }}
    />
  );
};

export default SectionRenderer;
