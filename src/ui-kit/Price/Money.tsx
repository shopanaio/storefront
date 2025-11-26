import type { model } from "@shopana/storefront-sdk";
import { useMoney } from "@src/hooks/useMoney";
import type { ComponentPropsWithoutRef, ElementType, ReactElement } from "react";
import { createElement } from "react";

type MoneyBaseProps = { money: model.Money };
type MoneyAsProps<P extends ElementType> = { as: P } & Omit<ComponentPropsWithoutRef<P>, "children">;

export function Money(props: MoneyBaseProps): string;
export function Money<P extends ElementType>(props: MoneyBaseProps & MoneyAsProps<P>): ReactElement | null;
export function Money<P extends ElementType = "span">(
  props: MoneyBaseProps & { as?: P } & Omit<ComponentPropsWithoutRef<P>, "children">
): ReactElement | string | null {
  const { money, as, ...rest } = props as MoneyBaseProps & { as?: ElementType } & Record<string, unknown>;
  const { localizedString } = useMoney(money);

  if (!as) {
    return localizedString;
  }

  return createElement(as, rest, localizedString);
}
