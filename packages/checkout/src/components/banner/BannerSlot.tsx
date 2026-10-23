'use client';

import { useState } from 'react';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { LuChevronDown } from 'react-icons/lu';
import { Banner, mq, useBannerTone } from '@shopana/storefront-ui';
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
  // The toggle sits in the last banner shown and speaks in its tone.
  const host = open ? banners[banners.length - 1] : first;
  const tone = useBannerTone(host?.tone ?? 'action');
  const toned = { color: tone.text, borderColor: tone.border };

  let toggle = null;
  if (open) {
    toggle = (
      <button
        type="button"
        className={styles.link}
        style={toned}
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
        style={toned}
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
        style={toned}
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
            <Banner
              key={banner.id}
              tone={banner.tone}
              title={banner.title}
              description={banner.description}
              action={banner.action}
              onDismiss={banner.onDismiss}
              extra={index === banners.length - 1 ? toggle : undefined}
            />
          ))
        ) : (
          <Banner
            key={first.id}
            tone={first.tone}
            title={first.title}
            action={first.action}
            onDismiss={first.onDismiss}
            extra={toggle}
            compact
          />
        )
      ) : null}
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => {
  // The counter is a pill one line of small text high.
  const counterHeight = Math.round(token.fontSizeSM * token.lineHeightSM);
  return {
    slot: css`
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: ${token.marginXS}px;

      ${mq.lg} {
        /* One compact banner: a line of text, its padding and its border. */
        min-height: ${Math.round(token.fontSize * token.lineHeight) +
        2 * token.paddingSM +
        2 * token.lineWidth}px;
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
      /* Inside the banner, in the colors of its tone. */
      min-width: ${counterHeight + token.paddingXS}px;
      margin-right: ${token.marginXS}px;
      padding: 0 ${token.paddingXXS}px;
      border: ${token.lineWidth}px solid;
      border-radius: ${counterHeight / 2 + token.lineWidth}px;
      background: transparent;
      font: inherit;
      font-size: ${token.fontSizeSM}px;
      line-height: ${counterHeight}px;
      font-weight: 500;
      cursor: pointer;
    `,
    chevron: css`
      /* A 44px touch target around the icon (a large control and a little), clear of the action. */
      display: flex;
      align-items: center;
      justify-content: center;
      width: ${token.controlHeight}px;
      height: ${token.controlHeightLG + token.paddingXXS}px;
      margin: -${token.paddingSM}px
        ${token.marginXXS}px -${token.paddingSM}px -${token.marginXS}px;
      padding: 0;
      border: 0;
      background: transparent;
      cursor: pointer;
    `,
    link: css`
      /* Clear of the action next to it, whose touch padding reaches here. */
      margin: -${token.paddingSM}px
        ${token.marginXS}px -${token.paddingSM}px -${token.marginXS}px;
      padding: ${token.paddingSM}px ${token.paddingXS}px;
      border: 0;
      background: transparent;
      font: inherit;
      text-decoration: underline;
      text-underline-offset: ${token.lineWidthBold}px;
      white-space: nowrap;
      cursor: pointer;
    `,
  };
});
