'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { mq } from '@src/ui-kit/Theme/breakpoints';
import { WishlistFeatures, WishlistSectionId } from '@src/modules/wishlist/types';
import { WishlistSectionRenderer } from '@src/modules/wishlist/infra/SectionRenderer';
import { WishlistSection } from '@src/modules/wishlist/components/common/WishlistSection';
import { WishlistActions } from '@src/modules/wishlist/components/actions/WishlistActions';
import { WishlistSummary } from '@src/modules/wishlist/components/summary/WishlistSummary';
import { WishlistSkeleton } from '@src/modules/wishlist/components/WishlistSkeleton';
import { useWishlistData } from '@src/modules/wishlist/context/WishlistDataContext';
import { useTranslations } from 'next-intl';

interface Props {
  brand?: React.ReactNode;
  features?: WishlistFeatures;
  validationError: string | null;
  onClearError: () => void;
}

export const WishlistView = ({
  brand,
  features,
  validationError,
  onClearError,
}: Props) => {
  void features;
  const { wishlist, loaded } = useWishlistData();
  const t = useTranslations('Wishlist');
  const { styles } = useStyles();

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.main}>
          <Flex vertical gap={24} className={styles.left}>
            {brand}
            <WishlistSection title={t('sections.saved-items', { defaultMessage: 'Saved items' })}>
              <WishlistSectionRenderer slug={WishlistSectionId.SavedItems} />
            </WishlistSection>
            <WishlistActions
              validationError={validationError}
              onClearError={onClearError}
            />
          </Flex>
          <div className={styles.rightContainer}>
            <Flex vertical gap={16} className={styles.right}>
              <WishlistSummary />
            </Flex>
          </div>
        </div>
      </div>
      <WishlistSkeleton isReady={loaded && wishlist.items.length >= 0} />
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  wrapper: css`
    position: relative;
    width: 100%;
  `,
  container: css`
    display: flex;
    flex-direction: column;
    width: 100%;
    /* wishlist layout variables */
    --wishlist-content-max: 1280px;
    /* make left column slightly wider than right */
    --wishlist-left-ratio: 0.65;
    --wishlist-right-ratio: calc(1 - var(--wishlist-left-ratio));
    --wishlist-left-fr: 1.3fr;
    --wishlist-right-fr: 0.7fr;
    --wishlist-left-max: calc(
      var(--wishlist-content-max) * var(--wishlist-left-ratio)
    );
    --wishlist-right-max: calc(
      var(--wishlist-content-max) * var(--wishlist-right-ratio)
    );
  `,
  main: css`
    display: flex;
    flex-direction: column;
    height: 100%;

    ${mq.lg} {
      display: grid;
      grid-template-columns: var(--wishlist-left-fr) var(--wishlist-right-fr);
    }
  `,
  left: css`
    width: 100%;
    border-right: 2px solid ${token.colorBorderSecondary};
    padding: ${token.padding}px;

    ${mq.lg} {
      margin-left: auto;
      max-width: var(--wishlist-left-max);
      padding: ${token.paddingXL}px;
    }
  `,
  rightContainer: css`
    background-color: ${token.colorBgLayout};
  `,
  right: css`
    width: 100%;
    padding: ${token.padding}px;

    ${mq.lg} {
      max-width: var(--wishlist-right-max);
      position: sticky;
      padding: ${token.paddingXL}px;
      top: 0;
      align-self: flex-start;
    }
  `,
}));
