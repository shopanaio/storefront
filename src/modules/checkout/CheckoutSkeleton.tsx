import { Flex, Skeleton } from "antd";
import { createStyles } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";

export const CheckoutSkeleton = () => {
  const { styles } = useStyles();

  return (
    <Flex className={styles.container} vertical gap={22}>
      <div className={styles.main}>
        <Flex className={styles.contactShippingSection}>
          <Flex vertical gap={24}>
            <div className={styles.titleSkeleton}>
              <div className={styles.size}>
                <Skeleton.Input block />
              </div>
            </div>

            <Flex vertical gap={16} className={styles.paragraph}>
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

        <Flex className={styles.orderSummaryBg}>
          <Flex vertical gap={12} className={styles.orderSummarySection}>
            <Flex vertical gap={24}>
              <div className={styles.titleSkeleton}>
                <div className={styles.size}>
                  <Skeleton.Input block />
                </div>
              </div>

              <Flex vertical gap={16} className={styles.paragraph}>
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
        </Flex>
      </div>
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: ${token.padding}px 0;
  `,

  main: css`
    display: flex;
    flex-direction: column;
    height: 100%;

    ${mq.lg} {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    --width: 1280px;
    --offset: calc((100vw - var(--width)) / 2);

    --left-column-width: 737px;
    --right-column-width: calc(
      var(--width) - var(--left-column-width) + var(--offset)
    );

    ${mq.xl} {
      display: grid;
      justify-content: end;
      grid-template-columns: var(--left-column-width) var(--right-column-width);
    }

    ${mq.xxl} {
      --width: 1400px;
      --left-column-width: 850px;
    }
  `,

  contactShippingSection: css`
    flex-direction: column;
    gap: ${token.marginMD}px;

    padding: ${token.paddingXS}px ${token.padding}px;

    ${mq.lg} {
      padding: ${token.paddingXS}px ${token.paddingXL}px ${token.paddingXS}px
        ${token.padding}px;
    }

    ${mq.xl} {
      padding: ${token.paddingXS}px ${token.paddingXL}px ${token.paddingXL}px
        ${token.padding}px;
    }
  `,

  orderSummaryBg: css`
    display: none;

    ${mq.lg} {
      display: flex;
      background-color: ${token.colorBgLayout};
      width: 100%;
    }
  `,

  orderSummarySection: css`
    padding: ${token.paddingXS}px ${token.padding}px;

    ${mq.lg} {
      position: sticky;
      height: 100vh;
      top: 0;
      width: 100%;
    }

    --width: 1280px;
    --offset: calc((100vw - var(--width)) / 2);

    --left-column-width: 737px;

    ${mq.xl} {
      width: calc(var(--width) - var(--left-column-width));
    }
  `,

  titleSkeleton: css`
    display: none;
    ${mq.lg} {
      display: block;
      width: 60%;
    }
  `,

  paragraph: css`
    display: none;
    ${mq.md} {
      display: flex;
    }
  `,

  lastRow: css`
    max-width: 277px;

    ${mq.md} {
      max-width: 224px;
    }
  `,

  size: css`
    height: 16px;
    overflow: hidden;
    border-radius: 10px;
  `,
}));
