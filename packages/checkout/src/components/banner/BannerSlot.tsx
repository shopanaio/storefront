'use client';

import { useState } from 'react';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { LuChevronDown } from 'react-icons/lu';
import { CheckoutBanner } from '#checkout/ui/banner/CheckoutBanner';
import { mq } from '#checkout/ui/breakpoints';
import { useCheckoutBanners } from './useCheckoutBanners';

/**
 * The one checkout banner, above the submit button: the most important message in one line,
 * the others behind its counter. Without a banner the slot takes no room.
 */
export const BannerSlot = () => {
  const t = useTranslations('Checkout');
  const { styles, cx } = useStyles();
  const banners = useCheckoutBanners();
  const [expanded, setExpanded] = useState(false);
  const [first, ...rest] = banners;
  const detailed = Boolean(first?.description);
  const open = expanded && (rest.length > 0 || detailed);

  let toggle = null;
  if (open) {
    toggle = (
      <button
        type="button"
        className={styles.link}
        aria-expanded
        onClick={() => setExpanded(false)}
      >
        {t('banner-collapse')}
      </button>
    );
  } else if (rest.length > 0) {
    toggle = (
      <button
        type="button"
        className={styles.counter}
        aria-expanded={false}
        aria-label={t('banner-show-all', { count: banners.length })}
        onClick={() => setExpanded(true)}
      >
        {`+${rest.length}`}
      </button>
    );
  } else if (detailed) {
    // An icon, not a word: next to the action a word leaves the title no room on a phone.
    toggle = (
      <button
        type="button"
        className={styles.chevron}
        aria-expanded={false}
        aria-label={t('banner-details')}
        title={t('banner-details')}
        onClick={() => setExpanded(true)}
      >
        <LuChevronDown size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
    );
  }

  return (
    <div
      className={cx(styles.slot, open && styles.open, !first && styles.empty)}
    >
      {first ? (
        open ? (
          banners.map((banner, index) => (
            <CheckoutBanner
              key={banner.id}
              tone={banner.tone}
              title={banner.title}
              description={banner.description}
              action={banner.action}
              onDismiss={banner.onDismiss}
              dismissLabel={t('banner-close')}
              extra={index === banners.length - 1 ? toggle : undefined}
            />
          ))
        ) : (
          <CheckoutBanner
            key={first.id}
            tone={first.tone}
            title={first.title}
            action={first.action}
            onDismiss={first.onDismiss}
            dismissLabel={t('banner-close')}
            extra={toggle}
            compact
          />
        )
      ) : null}
    </div>
  );
};

const useStyles = createStyles(({ css }) => ({
  slot: css`
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 8px;

    ${mq.lg} {
      /* One compact banner: 19px line + 2 × 15px padding + 2 × 1px border. */
      min-height: 51px;
    }
  `,
  open: css`
    /* In the panel fixed to the bottom of a phone: the list scrolls, the button stays seen. */
    max-height: 60dvh;
    overflow-y: auto;
    overscroll-behavior: contain;

    ${mq.lg} {
      max-height: none;
      overflow-y: visible;
    }
  `,
  empty: css`
    display: none;
  `,
  counter: css`
    /* Inside the banner, whose tone colors it takes. */
    min-width: 28px;
    margin-right: 8px;
    padding: 0 6px;
    border: 1px solid var(--banner-border);
    border-radius: 10px;
    background: transparent;
    font: inherit;
    font-size: 12px;
    line-height: 17px;
    font-weight: 500;
    color: var(--banner-text);
    cursor: pointer;
  `,
  chevron: css`
    /* 44px touch target around the 16px icon, clear of the action next to it. */
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 44px;
    margin: -12px 4px -13px -8px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--banner-text);
    cursor: pointer;
  `,
  link: css`
    /* Clear of the action next to it, whose touch padding reaches here. */
    margin: -12px 8px -12px -8px;
    padding: 12px 8px;
    border: 0;
    background: transparent;
    font: inherit;
    color: var(--banner-text);
    text-decoration: underline;
    text-underline-offset: 2px;
    white-space: nowrap;
    cursor: pointer;
  `,
}));
