import { Media } from '../Media';

/**
 * SwatchDisplayType - type of swatch display
 */
export type SwatchDisplayType = 'COLOR' | 'COLOR_DUO' | 'IMAGE';

/**
 * Swatch - color or image swatch for product options
 */
export interface Swatch {
  /** Global unique identifier */
  id: string;
  /** Primary color in HEX format (e.g., "#ff0000") */
  color: string;
  /** Optional secondary color for gradients */
  color2?: string | null;
  /** Type of swatch display */
  displayType: SwatchDisplayType;
  /** Optional image file */
  image?: Media | null;
}
