import { css } from "@emotion/react";

/**
 * Mixin for multiline ellipsis with configurable number of lines.
 * @param lines — number of lines after which "…" is placed
 * @param lineHeight — line height in em (default 1.5)
 */
export const multilineEllipsis = (lines: number, lineHeight = 1.5) => css`
  /* set CSS variable to easily calculate fallback */
  --lines: ${lines};
  --line-height: ${lineHeight}em;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: var(--lines);
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  white-space: normal;
  line-height: var(--line-height);

  /* Fallback for browsers without -webkit-line-clamp support */
  @supports not (-webkit-line-clamp: var(--lines)) {
    max-height: calc(var(--lines) * var(--line-height));
  }
`;
