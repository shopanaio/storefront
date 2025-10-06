'use client';

import { sections, type SectionSlug } from '../../sections/sections';

interface Prop {
  slug: SectionSlug;
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
