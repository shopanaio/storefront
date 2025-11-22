import type { SectionProps } from '@src/core/page-builder/types';

export interface FooterSettings {
  copyrightText: string;
  backgroundColor: string;
  textColor: string;
  showSocial: boolean;
}

export default function Footer({ id, settings, blocks }: SectionProps<FooterSettings>) {
  const { copyrightText, backgroundColor, textColor, showSocial } = settings;

  return (
    <footer
      className="py-12 px-4"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-6xl mx-auto">
        {blocks && blocks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {blocks.map((block, index) => (
              <div key={index}>
                {block}
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-600 pt-8 text-center">
          <p className="text-sm">{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
