'use client';

import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useCheckoutReadiness } from '#checkout/hooks/useCheckoutReadiness';
import { useSubmitAttempted } from '#checkout/hooks/useSubmitAttempted';
import { issueSection } from '#checkout/state/issueSections';
import { issueText } from '#checkout/state/banners/messages';
import type { SectionId } from '#checkout/state/interface';

/**
 * Blocking issues of the given sections, as a quiet line in the section itself once the buyer
 * tried to place the order. The checkout banner above the submit button says which sections to
 * check; this line says what is wrong there.
 */
export const SectionIssues = ({ sections }: { sections: SectionId[] }) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const readiness = useCheckoutReadiness();
  const attempted = useSubmitAttempted();
  if (!attempted || !readiness || readiness.expired) return null;
  const texts = [
    ...new Set(
      readiness.blocking
        .filter((issue) => {
          const section = issueSection(issue);
          return section !== null && sections.includes(section);
        })
        .map((issue) => issueText(t, issue))
    ),
  ];
  if (texts.length === 0) return null;
  return (
    <ul className={styles.list}>
      {texts.map((text) => (
        <li key={text} className={styles.item}>
          {text}
        </li>
      ))}
    </ul>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  list: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;
  `,
  item: css`
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: ${token.fontSizeSM}px;
    line-height: ${token.lineHeightSM};
    color: ${token.colorErrorText};

    &::before {
      content: '';
      flex: none;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      transform: translateY(-1px);
    }
  `,
}));
