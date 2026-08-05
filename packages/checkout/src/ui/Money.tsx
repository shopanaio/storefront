'use client';

import type { model } from '@shopana/storefront-sdk';
import { useLocale } from 'next-intl';
import { createElement } from 'react';
import type { ComponentPropsWithoutRef, ElementType, ReactElement } from 'react';

type MoneyBaseProps = { money: model.Money };
type MoneyAsProps<P extends ElementType> = { as: P } & Omit<
  ComponentPropsWithoutRef<P>,
  'children'
>;

export function Money(props: MoneyBaseProps): string;
export function Money<P extends ElementType>(
  props: MoneyBaseProps & MoneyAsProps<P>
): ReactElement | null;
export function Money<P extends ElementType = 'span'>(
  props: MoneyBaseProps &
    { as?: P } & Omit<ComponentPropsWithoutRef<P>, 'children'>
): ReactElement | string | null {
  const locale = useLocale();
  const { money, as, ...rest } = props as MoneyBaseProps & {
    as?: ElementType;
  } & Record<string, unknown>;
  const localizedString = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currencyCode,
    trailingZeroDisplay: 'stripIfInteger',
  }).format(money.amount);

  return as ? createElement(as, rest, localizedString) : localizedString;
}
