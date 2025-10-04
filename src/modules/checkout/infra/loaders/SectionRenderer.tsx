'use client';

import { Flex } from 'antd';
import { sectionRegistry, SectionSlug } from '../../sections/registry';
import { DynamicRenderer } from './DynamicRenderer';
import { SectionTitle } from '@src/modules/checkout/components/common/SectionTitle';

interface Prop {
  slug: SectionSlug;
  /** Optional title to render above the section */
  title?: React.ReactNode;
  /** Optional action component to render next to the section title */
  headerAction?: React.ReactNode;
}

/**
 * Renders a checkout section by slug using the section registry.
 * Wraps DynamicRenderer with section-specific logic.
 */
export const SectionRenderer = ({ slug, title, headerAction }: Prop) => {
  const loader = sectionRegistry.resolve(slug);

  if (!loader) {
    return null;
  }

  return (
    <Flex vertical gap={12}>
      {(title || headerAction) && (
        <Flex justify="space-between" align="center">
          {title ? <SectionTitle>{title}</SectionTitle> : null}
          {headerAction}
        </Flex>
      )}
      <DynamicRenderer loader={loader} componentProps={{}} />
    </Flex>
  );
};

export default SectionRenderer;
