'use client';

import { Flex } from 'antd';
import { SectionTitle } from './SectionTitle';

interface Prop {
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
export const CheckoutSection = ({ title, headerAction, children }: Prop) => {
  return (
    <Flex vertical gap={12}>
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
