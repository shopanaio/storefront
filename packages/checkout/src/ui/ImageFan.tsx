'use client';

import { createStyles } from 'antd-style';
import type { Checkout } from '#checkout/types/entity';
import { composeProductTitle } from './composeProductTitle';
import { ProductImage } from './ProductImage';
import { THUMBNAIL_INSET, THUMBNAIL_SIZE } from './Thumbnail';

export interface ImageFanItem {
  key: string;
  src?: string | null;
  alt: string;
}

export interface ImageFanProps {
  /** The first lies on top; only the first three are drawn, the rest are left to a count. */
  images: ImageFanItem[];
  /** Side of a card; the whole fan scales with it and looks the same at any size. */
  size?: number;
  /**
   * The turned cards spill over the box above and under it, so the fan is as tall as a card and
   * stands where a thumbnail would; the parent leaves them room in its padding.
   */
  bleed?: boolean;
  className?: string;
}

/** Pictures of order lines for the fan, in their order. */
export const linesToFanImages = (lines: Checkout.Line[]): ImageFanItem[] =>
  lines.map((line) => ({
    key: line.id,
    src: line.imageSrc ?? line.purchasable?.cover?.url,
    alt: composeProductTitle({
      productTitle: line.purchasable?.product?.title,
      variantTitle: line.purchasable?.title ?? line.title,
      fallback: line.title,
    }),
  }));

/** Cards drawn in the fan. */
export const MAX_FAN_IMAGES = 3;

/** Side of a card by default: the thumbnail of the order summary, on a phone as on a desktop. */
const DEFAULT_SIZE = THUMBNAIL_SIZE;

/*
 * The fan is drawn in parts of the side of a card, so it keeps its look at any size; the angles
 * do not depend on the size at all.
 */
/** How far the card on the left moves out from under the front one. */
const LEFT_PEEK = 0.2;
/** How far the card on the right moves out from under the front one. */
const RIGHT_PEEK = 0.18;
/** How far the card on the right rises over the others. */
const RIGHT_LIFT = 0.04;
/** Space between the frame of a card and its picture: that of a thumbnail at its size. */
const INSET = THUMBNAIL_INSET / THUMBNAIL_SIZE;
/** How far the card on the left turns about its bottom edge, in degrees. */
const LEFT_ANGLE = 10;
/** How far the card on the right turns about its bottom edge: more than the left one. */
const RIGHT_ANGLE = 17;

const sin = (angle: number) => Math.sin((angle * Math.PI) / 180);
const cos = (angle: number) => Math.cos((angle * Math.PI) / 180);
/**
 * How far a card turned about the middle of its bottom edge reaches past its upright box: its
 * outer top corner swings out to the side, rises, and its outer bottom corner drops.
 */
const swing = (angle: number) => (cos(angle) - 1) / 2 + sin(angle);
const rise = (angle: number, lift: number) =>
  sin(angle) / 2 - (1 - cos(angle)) + lift;
const drop = (angle: number, lift: number) => sin(angle) / 2 - lift;
/**
 * How far the cards reach past the front one, up and down. The box keeps this room on both
 * sides, so a parent that hides its overflow never cuts a card.
 */
const REACH = Math.max(
  rise(LEFT_ANGLE, 0),
  drop(LEFT_ANGLE, 0),
  rise(RIGHT_ANGLE, RIGHT_LIFT),
  drop(RIGHT_ANGLE, RIGHT_LIFT)
);
/** Room on the left of the front card for the card turned out there, to its outer corner. */
const LEFT_ROOM = LEFT_PEEK + swing(LEFT_ANGLE);
/** Room on the right of the front card for the card turned out there, to its outer corner. */
const RIGHT_ROOM = RIGHT_PEEK + swing(RIGHT_ANGLE);

/** Shift, turn and lift of each card, front first: one card stands; two lean right; three spread. */
const POSES: Record<
  number,
  Array<[shift: number, turn: number, lift?: number]>
> = {
  1: [[0, 0]],
  2: [
    [0, 0],
    [RIGHT_PEEK, RIGHT_ANGLE, RIGHT_LIFT],
  ],
  3: [
    [0, 0],
    [-LEFT_PEEK, -LEFT_ANGLE],
    [RIGHT_PEEK, RIGHT_ANGLE, RIGHT_LIFT],
  ],
};

/**
 * Pictures of products as a fan of cards: the first stands upright on top, the ones behind
 * turn out from under it so their edges show. Used wherever a group of lines is folded into
 * its pictures, such as a collapsed shipment or the order summary on a phone.
 */
export function ImageFan({
  images,
  size = DEFAULT_SIZE,
  bleed = false,
  className,
}: ImageFanProps) {
  const { styles, cx } = useStyles({ size });
  const shown = images.slice(0, MAX_FAN_IMAGES);
  if (!shown.length) {
    return null;
  }
  const poses = POSES[shown.length];
  // Three cards spread both ways, so the front one stands in the middle.
  const left = shown.length === 3 ? LEFT_ROOM * size : 0;
  const width = left + size + (shown.length > 1 ? RIGHT_ROOM * size : 0);

  return (
    <span
      className={cx(styles.fan, bleed && styles.bleed, className)}
      style={{ width }}
    >
      {shown.map((image, index) => {
        const [shift, turn, lift = 0] = poses[index];
        return (
          <span
            key={image.key}
            className={cx(styles.card, index === 0 && styles.front)}
            style={{
              left,
              zIndex: shown.length - index,
              transform: `translate(${shift * size}px, ${-lift * size}px) rotate(${turn}deg)`,
            }}
          >
            <ProductImage
              src={image.src}
              alt={image.alt}
              className={styles.image}
            />
          </span>
        );
      })}
    </span>
  );
}

// The rounding and the shadow grow with the card as well; the frame stays a hairline.
const useStyles = createStyles(({ css, token }, { size }: { size: number }) => {
  const scale = size / DEFAULT_SIZE;
  const radius = token.borderRadius * scale;
  const inset = INSET * size;
  return {
    fan: css`
      position: relative;
      display: inline-block;
      flex: none;
      height: ${size + 2 * REACH * size}px;
    `,
    // A picture in the thin frame of the thumbnails of the order summary, turned about its bottom edge.
    card: css`
      position: absolute;
      bottom: ${REACH * size}px;
      display: inline-flex;
      box-sizing: border-box;
      width: ${size}px;
      height: ${size}px;
      padding: ${inset}px;
      overflow: hidden;
      border: 1px solid ${token.colorBorder};
      border-radius: ${radius}px;
      background-color: ${token.colorBgContainer};
      transform-origin: 50% 100%;
    `,
    bleed: css`
      margin-block: ${-REACH * size}px;
    `,
    front: css`
      box-shadow: 0 ${2 * scale}px ${6 * scale}px rgba(0, 0, 0, 0.1);
    `,
    image: css`
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: ${Math.max(radius - inset, 0)}px;
    `,
  };
});
