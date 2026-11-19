import type { GlobalToken } from 'antd';

/**
 * Tones of a banner, by what the reader has to do:
 * - `critical`: something failed and the task cannot go on until it is solved;
 * - `warning`: something changed on its own and is worth a look;
 * - `action`: the reader has to choose or fill something in;
 * - `info`: a calm note about how the page works, nothing to do yet;
 * - `success`: something the reader did worked.
 */
export type BannerTone = 'critical' | 'warning' | 'action' | 'info' | 'success';

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
 * Colors of a tone from the antd status tokens (error, warning, info, success) and, for `info`,
 * the neutral fill and text tokens, so they follow the theme and its dark algorithm.
 */
export function toneColors(
  token: GlobalToken,
  tone: BannerTone
): BannerToneColors {
  switch (tone) {
    case 'critical':
      return {
        background: token.colorErrorBg,
        border: token.colorErrorBorder,
        text: token.colorErrorTextActive,
        accent: token.colorErrorText,
      };
    case 'warning':
      return {
        background: token.colorWarningBg,
        border: token.colorWarningBorder,
        text: token.colorWarningTextActive,
        accent: token.colorWarningText,
      };
    case 'action':
      return {
        background: token.colorInfoBg,
        border: token.colorInfoBorder,
        text: token.colorInfoTextActive,
        accent: token.colorInfoText,
      };
    case 'info':
      return {
        background: token.colorFillAlter,
        border: token.colorBorderSecondary,
        text: token.colorText,
        accent: token.colorTextSecondary,
      };
    case 'success':
      return {
        background: token.colorSuccessBg,
        border: token.colorSuccessBorder,
        text: token.colorSuccessTextActive,
        accent: token.colorSuccessText,
      };
  }
}
