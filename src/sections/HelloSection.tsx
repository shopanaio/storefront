'use client';

import type { SectionProps } from '@shopana/storefront-sdk/core/types';

interface HelloSectionSettings {
  message?: string;
}

export default function HelloSection({
  settings,
}: SectionProps<HelloSectionSettings>) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          {settings.message ?? 'Hello from Shopana SDK'}
        </h1>
      </div>
    </section>
  );
}
