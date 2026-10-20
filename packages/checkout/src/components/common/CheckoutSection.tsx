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
  /** Section content */
  children: React.ReactNode;
}

/**
 * Common wrapper component for checkout sections.
 * Renders a title, optional header action, and section content.
 */
export const CheckoutSection = ({
  id,
  title,
  headerAction,
  children,
}: Prop) => {
  return (
    <Flex id={id} vertical gap={12}>
      {(title || headerAction) && (
        <Flex justify="space-between" align="center">
          {title ? <SectionTitle>{title}</SectionTitle> : null}
          {headerAction}
        </Flex>
      )}
      {children}
    </Flex>
  );
};
