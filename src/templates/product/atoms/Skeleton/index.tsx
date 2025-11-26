import { Flex, Skeleton } from "antd";
import { createStyles } from "antd-style";
import { GallerySkeleton } from "../GallerySkeleton";
import { mq } from "@src/components/UI/Theme/breakpoints";

export const SkeletonProduct = () => {
  const { styles } = useStyles();

  return (
    <Flex className={styles.container} vertical gap={22}>
      <div className={styles.breadcrumbsSkeleton}>
        <div className={styles.size}>
          <Skeleton.Input block />
        </div>
      </div>

      <div className={styles.main}>
        <GallerySkeleton />

        <Flex className={styles.textWrapper} vertical gap={24}>
          <div className={styles.titleWrapper}>
            <div className={styles.size}>
              <Skeleton.Input block />
            </div>
          </div>

          <Flex vertical gap={24}>
            <Flex vertical gap={16}>
              <div className={styles.size}>
                <Skeleton.Input block />
              </div>
              <div className={styles.size}>
                <Skeleton.Input block />
              </div>
              <div className={styles.size}>
                <Skeleton.Input block />
              </div>
              <div className={styles.lastRow}>
                <div className={styles.size}>
                  <Skeleton.Input block />
                </div>
              </div>
            </Flex>

            <Flex vertical gap={16} className={styles.sndParagraph}>
              <div className={styles.size}>
                <Skeleton.Input block />
              </div>
              <div className={styles.size}>
                <Skeleton.Input block />
              </div>
              <div className={styles.size}>
                <Skeleton.Input block />
              </div>
              <div className={styles.size}>
                <Skeleton.Input block />
              </div>
              <div className={styles.lastRow}>
                <div className={styles.size}>
                  <Skeleton.Input block />
                </div>
              </div>
            </Flex>
          </Flex>
        </Flex>
      </div>
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    width: 100%;
    padding: ${token.padding}px;

    ${mq.xl} {
      margin-right: auto;
      margin-left: auto;

      max-width: 1280px;
    }

    ${mq.xxl} {
      max-width: 1440px;
    }
  `,

  breadcrumbsSkeleton: css`
    display: none;
    ${mq.lg} {
      display: block;
      width: 300px;
    }
  `,

  main: css`
    display: flex;
    flex-direction: column;
    /* gap: ${token.marginLG}px; */

    ${mq.lg} {
      display: grid;
      grid-template-columns: 60% auto;
      gap: ${token.marginMD}px;
    }

    ${mq.xl} {
      grid-template-columns: calc(641px + 72px + 8px) auto;
      gap: ${token.margin}px;
    }

    ${mq.xxl} {
      grid-template-columns: calc(746px + 86px + 8px) auto;
      gap: ${token.marginXXL}px;
    }
  `,
  galleryBox: css`
    flex-direction: column;
    width: 100%;
    border-radius: ${token.borderRadius}px;
    ${mq.xl} {
      flex-direction: row-reverse;
    }
  `,

  bigImgWrapper: css`
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    ${mq.xl} {
      width: 640px;
    }

    ${mq.xl} {
      width: 746px;
    }
  `,

  skeletonPrevBox: css`
    display: none;
    ${mq.lg} {
      display: flex;
      flex-direction: row;
    }
    ${mq.xl} {
      flex-direction: column;
    }
  `,
  preview: css`
    overflow: hidden;
    width: calc(100% / 7);
    aspect-ratio: 1 / 1;

    padding: ${token.paddingXXS}px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    ${mq.xl} {
      width: 72px;
    }
    ${mq.xxl} {
      width: 86px;
    }
  `,
  previewInner: css`
    overflow: hidden;
    aspect-ratio: 1 / 1;
    border-radius: ${token.borderRadius}px;
  `,
  textWrapper: css`
    ${mq.lg} {
      min-width: 356px;
    }
  `,
  titleWrapper: css`
    width: 70%;
  `,

  lastRow: css`
    max-width: 277px;
  `,

  sndParagraph: css`
    display: none;
    ${mq.md} {
      display: flex;
    }
  `,
  size: css`
    height: 16px;
    overflow: hidden;
    border-radius: 10px;
  `,
}));
