'use client';

import { sections } from '../../sections/sections';
import { SectionId } from '@src/modules/checkout/state/interface';

interface Prop {
  slug: SectionId;
}

/**
 * Renders a checkout section by slug using the sections map.
 */
export const SectionRenderer = ({ slug }: Prop) => {
  const section = sections[slug];

  if (!section) {
    return null;
  }

  const { Component } = section;
  return <Component />;
};

export default SectionRenderer;
