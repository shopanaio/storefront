import type { GlobalToken } from 'antd';

/**
 * How a chosen option with a border shows that it is chosen: the primary border and, under it,
 * the light strip antd's primary button has (its `primaryShadow`), so options and buttons look
 * alike and follow the theme together.
 */
export function selectedDeclarations(
  token: Pick<
    GlobalToken,
    'colorPrimary' | 'controlOutline' | 'controlOutlineWidth'
  >
): string {
  return `
    border-color: ${token.colorPrimary} !important;
    box-shadow: 0 ${token.controlOutlineWidth}px 0 ${token.controlOutline};
  `;
}
