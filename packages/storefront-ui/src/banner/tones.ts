/**
 * Tones of a checkout banner, by what the buyer has to do:
 * - `critical`: something failed and the order cannot go on (payment, placement, a save);
 * - `warning`: the order changed on its own (stock, price, promo code);
 * - `action`: the buyer has to choose or fill something in;
 * - `success`: something the buyer did worked.
 */
export type BannerTone = 'critical' | 'warning' | 'action' | 'success';

export interface BannerToneColors {
  /** Background of the banner. */
  background: string;
  border: string;
  /** Title and description. */
  text: string;
  /** Icon and the action link. */
  accent: string;
}

/**
 * Brand palette of the banners (store colors, "action" in the brand blue). Each color is a CSS
 * custom property, `--banner-<tone>-<part>`, so a theme can override any of them in CSS.
 */
export const BANNER_TONES: Record<BannerTone, BannerToneColors> = {
  critical: {
    background: '#fff2f0',
    border: '#ffccc7',
    text: '#5c0011',
    accent: '#cf1322',
  },
  warning: {
    background: '#fffbe6',
    border: '#ffe58f',
    text: '#3d2600',
    accent: '#ad5f00',
  },
  action: {
    background: '#f0f6ff',
    border: '#bfd4f5',
    text: '#0e2160',
    accent: '#1c49c2',
  },
  success: {
    background: '#f6ffed',
    border: '#b7eb8f',
    text: '#092b00',
    accent: '#237804',
  },
};

const PARTS: Array<keyof BannerToneColors> = [
  'background',
  'border',
  'text',
  'accent',
];

/** Name of the CSS custom property holding one color of a tone. */
export function bannerToneVar(
  tone: BannerTone,
  part: keyof BannerToneColors
): string {
  return `--banner-${tone}-${part}`;
}

/**
 * Declarations of every tone color, for the root of the checkout. A banner outside it (in a
 * drawer, which is portalled out) falls back to the same colors.
 */
export function bannerToneDeclarations(): string {
  return (Object.keys(BANNER_TONES) as BannerTone[])
    .flatMap((tone) =>
      PARTS.map(
        (part) => `${bannerToneVar(tone, part)}: ${BANNER_TONES[tone][part]};`
      )
    )
    .join('\n');
}
