'use client';

import { createStyles } from 'antd-style';
import { ProductImage } from './ProductImage';

export interface ImageFanItem {
  key: string;
  src?: string | null;
  alt: string;
}

export interface ImageFanProps {
  /** The first lies on top; only the first three are drawn, the rest are left to a count. */
  images: ImageFanItem[];
  className?: string;
}

/** Cards drawn in the fan. */
export const MAX_FAN_IMAGES = 3;

/** Side of a card: the same as a thumbnail of the order summary. */
const SIZE = 50;
/** How far a card behind moves out from under the front one. */
const PEEK = 15;
/** How far a card behind turns about its bottom edge. */
const ANGLE = 14;
/** Room for the corner a turned card swings out, and for the white ring around it. */
const SWING = Math.ceil(SIZE * Math.sin((ANGLE * Math.PI) / 180)) + 2;
/** Room around the cards for the ring, which the box would cut. */
const RING = 1;
/**
 * How far a turned card reaches past its upright box, up and down: a card turns about the middle
 * of its bottom edge, so one bottom corner drops below it and the top rises. The box keeps this
 * room on both sides, so a parent that hides its overflow never cuts a card.
 */
const REACH = Math.ceil((SIZE / 2) * Math.sin((ANGLE * Math.PI) / 180)) + RING;

/** Shift and turn of each card, front first: one card stands; two lean right; three spread. */
const POSES: Record<number, Array<[shift: number, turn: number]>> = {
  1: [[0, 0]],
  2: [
    [0, 0],
    [PEEK, ANGLE],
  ],
  3: [
    [0, 0],
    [-PEEK, -ANGLE],
    [PEEK, ANGLE],
  ],
};

/**
 * Pictures of products as a fan of cards: the first stands upright on top, the ones behind
 * turn out from under it so their edges show. Used wherever a group of lines is folded into
 * its pictures, such as a collapsed shipment or the order summary on a phone.
 */
export function ImageFan({ images, className }: ImageFanProps) {
  const { styles, cx } = useStyles();
  const shown = images.slice(0, MAX_FAN_IMAGES);
  if (!shown.length) {
    return null;
  }
  const poses = POSES[shown.length];
  // Three cards spread both ways, so the front one stands in the middle.
  const left = shown.length === 3 ? PEEK + SWING : RING;
  const width =
    shown.length === 3
      ? SIZE + 2 * (PEEK + SWING)
      : shown.length === 2
        ? RING + SIZE + PEEK + SWING
        : SIZE + 2 * RING;

  return (
    <span className={cx(styles.fan, className)} style={{ width }}>
      {shown.map((image, index) => {
        const [shift, turn] = poses[index];
        return (
          <span
            key={image.key}
            className={cx(styles.card, index === 0 && styles.front)}
            style={{
              left,
              zIndex: shown.length - index,
              transform: `translateX(${shift}px) rotate(${turn}deg)`,
            }}
          >
            <ProductImage src={image.src} alt={image.alt} className={styles.image} />
          </span>
        );
      })}
    </span>
  );
}

const useStyles = createStyles(({ css, token }) => ({
  fan: css`
    position: relative;
    display: inline-block;
    flex: none;
    height: ${SIZE + 2 * REACH}px;
  `,
  // A thumbnail framed like the ones of the order summary, turned about its bottom edge.
  card: css`
    position: absolute;
    bottom: ${REACH}px;
    display: inline-flex;
    box-sizing: border-box;
    width: ${SIZE}px;
    height: ${SIZE}px;
    padding: 2px;
    overflow: hidden;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    background-color: ${token.colorBgContainer};
    box-shadow: 0 0 0 ${RING}px ${token.colorBgContainer};
    transform-origin: 50% 100%;
  `,
  front: css`
    box-shadow:
      0 0 0 ${RING}px ${token.colorBgContainer},
      0 2px 6px rgba(0, 0, 0, 0.1);
  `,
  image: css`
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: ${Math.max(token.borderRadius - 2, 0)}px;
  `,
}));
