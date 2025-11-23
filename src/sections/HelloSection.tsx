'use client';

import type { SectionProps } from '@shopana/next-ecommerce-core';
import { Block } from '@shopana/next-ecommerce-core';

interface HelloSectionSettings {
  title: string;
  subtitle?: string;
}

interface HelloSectionData {
  message?: string;
}

export default function HelloSection({
  id,
  settings,
  blocks,
  data,
}: SectionProps<HelloSectionSettings, HelloSectionData>) {
  return (
    <section id={id} className="py-12 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">
          {settings.title}
        </h1>

        {settings.subtitle && (
          <p className="text-xl text-gray-600 mb-8">
            {settings.subtitle}
          </p>
        )}

        {data.message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-lg text-blue-800">{data.message}</p>
          </div>
        )}

        {blocks && blocks.length > 0 && (
          <div className="space-y-4">
            {blocks.map((block) => (
              <Block key={block.id} {...block} />
            ))}
          </div>
        )}

        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-2xl font-semibold text-green-800 mb-2">
            🎉 Framework Integration Success!
          </h2>
          <p className="text-green-700">
            The @shopana/next-ecommerce-core page builder framework is working correctly.
            This page was built using the Builder component with templates, sections, and blocks.
          </p>
        </div>
      </div>
    </section>
  );
}
