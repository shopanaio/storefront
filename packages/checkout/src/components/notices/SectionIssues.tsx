'use client';

import { Alert, Flex } from 'antd';
import { useCheckoutReadiness } from '#checkout/hooks/useCheckoutReadiness';
import { useSubmitAttempted } from '#checkout/hooks/useSubmitAttempted';
import { issueSection } from '#checkout/state/issueSections';
import type { SectionId } from '#checkout/state/interface';

/**
 * Blocking issues of the given sections, shown in the section itself once the buyer tried to
 * place the order (stage 5, task 1). Texts come from the API as they are.
 */
export const SectionIssues = ({ sections }: { sections: SectionId[] }) => {
  const readiness = useCheckoutReadiness();
  const attempted = useSubmitAttempted();
  if (!attempted || !readiness || readiness.expired) return null;
  const issues = readiness.blocking.filter((issue) => {
    const section = issueSection(issue);
    return section !== null && sections.includes(section);
  });
  if (issues.length === 0) return null;
  return (
    <Flex vertical gap={8}>
      {issues.map((issue, index) => (
        <Alert
          key={`${issue.code}-${issue.field.join('.')}-${index}`}
          type={issue.severity === 'ERROR' ? 'error' : 'warning'}
          showIcon
          title={issue.message}
        />
      ))}
    </Flex>
  );
};
