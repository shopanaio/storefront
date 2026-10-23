'use client';

import type { model } from '@shopana/storefront-sdk';
import { useLocale } from 'next-intl';
import { createElement } from 'react';
import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactElement,
} from 'react';

type MoneyBaseProps = { money: model.Money };
type MoneyAsProps<P extends ElementType> = { as: P } & Omit<
  ComponentPropsWithoutRef<P>,
  'children'
>;

/** Amount in the currency format of the locale, without trailing zeros of whole amounts. */
export const formatMoney = (locale: string, money: model.Money): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currencyCode,
    trailingZeroDisplay: 'stripIfInteger',
  }).format(money.amount);

export function Money(props: MoneyBaseProps): string;
export function Money<P extends ElementType>(
  props: MoneyBaseProps & MoneyAsProps<P>
): ReactElement | null;
export function Money<P extends ElementType = 'span'>(
  props: MoneyBaseProps & { as?: P } & Omit<
      ComponentPropsWithoutRef<P>,
      'children'
    >
): ReactElement | string | null {
  const locale = useLocale();
  const { money, as, ...rest } = props as MoneyBaseProps & {
    as?: ElementType;
  } & Record<string, unknown>;
  const localizedString = formatMoney(locale, money);

  return as ? createElement(as, rest, localizedString) : localizedString;
}
