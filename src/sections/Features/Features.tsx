import type { SectionProps } from '@src/core/page-builder/types';

export interface FeaturesSettings {
  title: string;
  description: string;
  columns: 2 | 3 | 4;
}

export default function Features({ id, settings, blocks }: SectionProps<FeaturesSettings>) {
  const { title, description, columns } = settings;

  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-gray-600">{description}</p>
        </div>

        {blocks && blocks.length > 0 && (
          <div className={`grid ${gridClasses[columns]} gap-8`}>
            {blocks.map((block, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                {block}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
