'use client';

import { Flex } from 'antd';
import { SectionTitle } from './SectionTitle';

interface Prop {
  /** Id of the section on the page, for actions that send the buyer to it. */
  id?: string;
  /** Optional title to render above the section */
  title?: React.ReactNode;
  /** Optional action component to render next to the section title */
  headerAction?: React.ReactNode;
  /**
   * Space between the title and the content, 8px by default; less where a header action taller
   * than the title already adds room under it.
   */
  titleGap?: number;
  /** Section content */
  children: React.ReactNode;
}

/**
 * Common wrapper component for checkout sections.
 * Renders a title, optional header action, and section content. The title sits closer to the
 * content (8px) than the parts of the content to each other (12px).
 */
export const CheckoutSection = ({
  id,
  title,
  headerAction,
  titleGap = 8,
  children,
}: Prop) => {
  return (
    <Flex id={id} vertical gap={titleGap}>
      {(title || headerAction) && (
        // On a phone a long header action goes under the title instead of squeezing it.
        <Flex justify="space-between" align="center" wrap gap={8}>
          {title ? <SectionTitle>{title}</SectionTitle> : null}
          {headerAction}
        </Flex>
      )}
      <Flex vertical gap={12}>
        {children}
      </Flex>
    </Flex>
  );
};
