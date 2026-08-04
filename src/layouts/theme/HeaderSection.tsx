'use client';

import { Section } from '@shopana/storefront-sdk/core/Section';
import { headerSection } from './HeaderSection.config';

export const HeaderSection = () => {
  return (
    <Section
      id="header"
      component={headerSection.component}
      settings={headerSection.settings}
      blocks={undefined}
      data={null}
    />
  );
};
