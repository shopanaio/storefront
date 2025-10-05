'use client';

import { sectionRegistry, SectionSlug } from '../../sections/registry';
import { DynamicRenderer } from './DynamicRenderer';

interface Prop {
  slug: SectionSlug;
}

/**
 * Renders a checkout section by slug using the section registry.
 * Uses DynamicRenderer to load and render the section component.
 */
export const SectionRenderer = ({ slug }: Prop) => {
  const loader = sectionRegistry.resolve(slug);

  if (!loader) {
    return null;
  }

  return <DynamicRenderer loader={loader} componentProps={{}} />;
};

export default SectionRenderer;
