'use client';

import { useState } from 'react';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { CheckoutBanner } from '#checkout/ui/banner/CheckoutBanner';
import { mq } from '#checkout/ui/breakpoints';
import { useCheckoutBanners } from './useCheckoutBanners';

/**
 * The one checkout banner, above the submit button: the most important message in one line,
 * the others behind its counter. On desktop the slot keeps the height of one line even when
 * empty, so the form does not move when a banner comes or goes.
 */
export const BannerSlot = () => {
  const t = useTranslations('Checkout');
  const { styles, cx } = useStyles();
  const banners = useCheckoutBanners();
  const [expanded, setExpanded] = useState(false);
  const [first, ...rest] = banners;
  const detailed = Boolean(first?.description);
  const open = expanded && (rest.length > 0 || detailed);

  const toggle =
    rest.length > 0 || detailed ? (
      <button
        type="button"
        className={open || rest.length === 0 ? styles.link : styles.counter}
        aria-expanded={open}
        aria-label={
          open
            ? t('banner-collapse')
            : rest.length > 0
              ? t('banner-show-all', { count: banners.length })
              : t('banner-details')
        }
        onClick={() => setExpanded(!open)}
      >
        {open
          ? t('banner-collapse')
          : rest.length > 0
            ? `+${rest.length}`
            : t('banner-details')}
      </button>
    ) : null;

  return (
    <div className={cx(styles.slot, !first && styles.empty)}>
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
  empty: css`
    display: none;

    ${mq.lg} {
      display: flex;
      visibility: hidden;
    }
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
