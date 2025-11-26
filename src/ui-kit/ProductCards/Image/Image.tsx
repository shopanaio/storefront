import { createStyles } from "antd-style";
import { Image } from "antd";
import { useHover } from "@src/ui-kit/hooks/useHover";
import { fallbackImageBase64 } from "@src/ui-kit/fallbackImageBase64";

export interface ProductCardImageProps {
  gallery: string[];
}

export const ProductCardImage = ({ gallery }: ProductCardImageProps) => {
  const { styles } = useStyles();

  const [isHovering, handlers] = useHover();

  // use first image from gallery
  const firstImage = gallery[0] || "";
  const secondImage = gallery[1]; // Second image for hover effect

  return (
    <div {...handlers} className={styles.container}>
      {secondImage && (
        <div
          className={styles.imageContainer}
          style={{ opacity: isHovering ? 1 : 0 }}
        >
          <Image
            loading="lazy"
            src={secondImage}
            alt=""
            width="100%"
            className={styles.image}
            preview={false}
            fallback={fallbackImageBase64}
          />
        </div>
      )}
      <div
        className={styles.imageContainer}
        style={{ opacity: secondImage && isHovering ? 0 : 1 }}
      >
        <Image
          loading="lazy"
          src={firstImage}
          className={styles.image}
          alt=""
          width="100%"
          preview={false}
          fallback={fallbackImageBase64}
        />
      </div>
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      display: flex;
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 100%;
      border-radius: ${token.borderRadius}px;
    `,
    imageContainer: css`
      position: absolute;
      inset: 0;
    `,
    image: css`
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      aspect-ratio: 1 / 1;
    `,
  };
});
