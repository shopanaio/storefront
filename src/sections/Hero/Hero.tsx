import type { SectionProps } from '@src/core/page-builder/types';

export interface HeroSettings {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  backgroundColor: string;
  textColor: string;
}

export default function Hero({ id, settings, blocks }: SectionProps<HeroSettings>) {
  const { title, subtitle, backgroundImage, backgroundColor, textColor } = settings;

  const backgroundStyle = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor };

  return (
    <section
      className="relative py-20 px-4"
      style={{ ...backgroundStyle, color: textColor }}
    >
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4">{title}</h1>
        <p className="text-xl mb-8">{subtitle}</p>

        {blocks && blocks.length > 0 && (
          <div className="flex gap-4 justify-center flex-wrap">
            {blocks}
          </div>
        )}
      </div>
    </section>
  );
}
