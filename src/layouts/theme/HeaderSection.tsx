'use client';

import { Section } from '@shopana/storefront-sdk/core/Section';
import { useMemo } from 'react';
import { headerSection, resolveHeaderSettings } from './HeaderSection.config';
import type { HeaderSettingsOverrides } from './HeaderSection.types';

export interface HeaderSectionProps {
  settings?: HeaderSettingsOverrides;
}

export const HeaderSection = ({ settings: overrides }: HeaderSectionProps) => {
  const settings = useMemo(() => resolveHeaderSettings(overrides), [overrides]);

  return (
    <Section
      id="header"
      component={headerSection.component}
      settings={settings}
      blocks={undefined}
      data={null}
    />
  );
};
