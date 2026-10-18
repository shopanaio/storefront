'use client';

import { Alert, Flex } from 'antd';
import { useTranslations } from 'next-intl';
import { useCheckoutReadiness } from '#checkout/hooks/useCheckoutReadiness';
import { useSubmitAttempted } from '#checkout/hooks/useSubmitAttempted';
import { useMissingRequiredSections } from '#checkout/state/selectors';
import { issueSection } from '#checkout/state/issueSections';
import type { SectionId } from '#checkout/state/interface';

/**
 * Issues of the latest checkout calculation, above the submit button (decision 5.4). Texts come
 * from the API as they are. Warnings are always shown; blocking issues appear once the buyer
 * tried to place the order, so an unfinished form does not open with errors. A blocking issue
 * of a section is shown in that section (`SectionIssues`); here a line names those sections.
 */
export const IssueNotices = () => {
  const t = useTranslations('Checkout');
  const readiness = useCheckoutReadiness();
  const missing = useMissingRequiredSections();
  const attempted = useSubmitAttempted();

  if (!readiness || readiness.expired) return null;
  const blocking = attempted ? readiness.blocking : [];
  const general = blocking.filter((issue) => issueSection(issue) === null);
  const sections = [
    ...new Set(
      blocking.map(issueSection).filter((section): section is SectionId => section !== null)
    ),
  ];
  // The sections themselves name what is missing; this covers a checkout the API keeps open.
  const notReady =
    attempted && !readiness.canPlace && blocking.length === 0 && missing.length === 0;
  if (
    readiness.notices.length === 0 &&
    general.length === 0 &&
    sections.length === 0 &&
    !notReady
  ) {
    return null;
  }

  return (
    <Flex vertical gap={8}>
      {[...general, ...readiness.notices].map((issue, index) => (
        <Alert
          key={`${issue.code}-${issue.lineId ?? issue.field.join('.')}-${index}`}
          type={issue.severity === 'ERROR' ? 'error' : 'warning'}
          showIcon
          title={issue.message}
        />
      ))}
      {sections.length > 0 ? (
        <Alert
          type="error"
          showIcon
          title={t('issues-in-sections', {
            sections: sections.map((section) => t(section)).join(', '),
          })}
        />
      ) : null}
      {notReady ? <Alert type="info" showIcon title={t('checkout-not-ready')} /> : null}
    </Flex>
  );
};
