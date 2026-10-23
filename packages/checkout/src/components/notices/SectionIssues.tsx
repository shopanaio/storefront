'use client';

import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useCheckoutReadiness } from '#checkout/hooks/useCheckoutReadiness';
import { useSubmitAttempted } from '#checkout/hooks/useSubmitAttempted';
import { useUndeliverableLines } from '#checkout/hooks/useUndeliverableLines';
import { issueSection } from '#checkout/state/issueSections';
import {
  issueMessage,
  visibleBlockingIssues,
} from '#checkout/state/banners/messages';
import type { SectionId } from '#checkout/state/interface';

/**
 * Blocking issues of the given sections, as a quiet line in the section itself once the buyer
 * tried to place the order. The checkout banner above the submit button says which sections to
 * check; this line says what is wrong there.
 */
export const SectionIssues = ({ sections }: { sections: SectionId[] }) => {
  const t = useTranslations('Checkout');
  const { styles, cx } = useStyles();
  const readiness = useCheckoutReadiness();
  const attempted = useSubmitAttempted();
  const undeliverableCount = useUndeliverableLines().length;
  if (!attempted || !readiness || readiness.expired) return null;
  const items = new Map<string, boolean>();
  for (const issue of visibleBlockingIssues(
    readiness.blocking,
    undeliverableCount
  )) {
    const section = issueSection(issue);
    if (section === null || !sections.includes(section)) continue;
    const message = issueMessage(issue);
    // An unknown code would name the very section it is shown in.
    const text = t(message.section ? 'issue-check-here' : message.key);
    items.set(text, (items.get(text) ?? false) || issue.severity === 'ERROR');
  }
  if (items.size === 0) return null;
  return (
    <ul className={styles.list}>
      {[...items].map(([text, error]) => (
        <li key={text} className={cx(styles.item, !error && styles.warning)}>
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
  warning: css`
    color: ${token.colorWarningText};
  `,
}));
