import { Flex } from 'antd';
import type { ReactNode } from 'react';

/**
 * Space between the blocks of the order summary (lines, promo codes, rewards, my rewards,
 * totals): each block is a label over its content, and the space above a label is the same
 * everywhere.
 */
export const SUMMARY_BLOCK_GAP = 24;

/** Blocks of the order summary, one under another at the same distance. */
export const SummaryBlocks = ({ children }: { children: ReactNode }) => (
  <Flex vertical gap={SUMMARY_BLOCK_GAP}>
    {children}
  </Flex>
);
