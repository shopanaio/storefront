'use client';

import { createElement } from 'react';
import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactElement,
} from 'react';
import type { FormatMoneyOptions, MoneyInput } from '../core/formatter';
import { useFormatter } from './useFormatter';

type MoneyProps<P extends ElementType> = FormatMoneyOptions & {
  money: MoneyInput;
  as?: P;
} & Omit<ComponentPropsWithoutRef<P>, 'children' | 'as'>;

/** Amount in the active locale; renders a bare string unless `as` names an element. */
export function Money<P extends ElementType = 'span'>({
  money,
  as,
  stripTrailingZeros,
  currencyDisplay,
  ...rest
}: MoneyProps<P>): ReactElement | string {
  const { formatMoney } = useFormatter();
  const formatted = formatMoney(money, { stripTrailingZeros, currencyDisplay });
  return as ? createElement(as, rest, formatted) : formatted;
}
