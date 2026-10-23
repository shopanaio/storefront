/** Money as the API returns it: `Decimal` may arrive as a number or a decimal string. */
export interface MoneyInput {
  amount: number | string;
  currencyCode: string;
}

export interface FormatMoneyOptions {
  /** Drops `.00` of whole amounts: `₴640.00` → `₴640`. `true` by default. */
  stripTrailingZeros?: boolean;
  currencyDisplay?: Intl.NumberFormatOptions['currencyDisplay'];
}

export interface MoneyParts {
  currencyCode: string;
  /** Localized amount without the currency sign. */
  amount: string;
  /** Currency sign in the active locale (`₴`, `грн`, `$`). */
  currencySymbol: string;
  currencyNarrowSymbol: string;
  currencyName: string;
  /** Full localized string with the currency. */
  localizedString: string;
  /** Localized string without `.00` of whole amounts. */
  withoutTrailingZeros: string;
  withoutTrailingZerosAndCurrency: string;
  parts: Intl.NumberFormatPart[];
}

export interface StorefrontFormatter {
  locale: string;
  timeZone: string;
  formatMoney(money: MoneyInput, options?: FormatMoneyOptions): string;
  moneyParts(money: MoneyInput): MoneyParts;
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string;
  formatDate(
    value: string | number | Date,
    options?: Intl.DateTimeFormatOptions
  ): string;
}

const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function numberFormatter(
  locale: string,
  options: Intl.NumberFormatOptions
): Intl.NumberFormat {
  const key = JSON.stringify([locale, options]);
  let formatter = numberFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatters.set(key, formatter);
  }
  return formatter;
}

function dateFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const key = JSON.stringify([locale, options]);
  let formatter = dateFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateFormatters.set(key, formatter);
  }
  return formatter;
}

function isSupportedCurrency(currencyCode: string): boolean {
  try {
    new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode });
    return true;
  } catch {
    return false;
  }
}

function toAmount(money: MoneyInput): number {
  return typeof money.amount === 'number' ? money.amount : Number(money.amount);
}

function currencyOptions(
  money: MoneyInput,
  options: Intl.NumberFormatOptions = {}
): Intl.NumberFormatOptions {
  // Codes Intl does not know (crypto, custom) are shown as a decimal followed by the code.
  return isSupportedCurrency(money.currencyCode)
    ? { style: 'currency', currency: money.currencyCode, ...options }
    : {
        style: 'decimal',
        minimumFractionDigits: options.minimumFractionDigits ?? 2,
        maximumFractionDigits: options.maximumFractionDigits ?? 2,
      };
}

function withUnknownCode(money: MoneyInput, formatted: string): string {
  return isSupportedCurrency(money.currencyCode)
    ? formatted
    : `${formatted} ${money.currencyCode}`;
}

function currencyPart(parts: Intl.NumberFormatPart[], fallback: string) {
  return parts.find((part) => part.type === 'currency')?.value ?? fallback;
}

export function createFormatter({
  locale,
  timeZone,
}: {
  locale: string;
  timeZone: string;
}): StorefrontFormatter {
  const formatMoney: StorefrontFormatter['formatMoney'] = (
    money,
    { stripTrailingZeros = true, currencyDisplay } = {}
  ) => {
    const amount = toAmount(money);
    const whole = stripTrailingZeros && Number.isInteger(amount);
    const options = currencyOptions(money, {
      ...(currencyDisplay ? { currencyDisplay } : {}),
      ...(whole ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}),
    });
    return withUnknownCode(money, numberFormatter(locale, options).format(amount));
  };

  return {
    locale,
    timeZone,
    formatMoney,
    moneyParts(money) {
      const amount = toAmount(money);
      const parts = numberFormatter(locale, currencyOptions(money)).formatToParts(
        amount
      );
      const supported = isSupportedCurrency(money.currencyCode);
      if (!supported) {
        parts.push(
          { type: 'literal', value: ' ' },
          { type: 'currency', value: money.currencyCode }
        );
      }
      const whole = Number.isInteger(amount);
      return {
        currencyCode: money.currencyCode,
        amount: parts
          .filter((part) =>
            ['decimal', 'fraction', 'group', 'integer', 'minusSign'].includes(
              part.type
            )
          )
          .map((part) => part.value)
          .join(''),
        currencySymbol: currencyPart(parts, money.currencyCode),
        currencyNarrowSymbol: supported
          ? currencyPart(
              numberFormatter(
                locale,
                currencyOptions(money, { currencyDisplay: 'narrowSymbol' })
              ).formatToParts(amount),
              money.currencyCode
            )
          : money.currencyCode,
        currencyName: supported
          ? currencyPart(
              numberFormatter(
                locale,
                currencyOptions(money, { currencyDisplay: 'name' })
              ).formatToParts(amount),
              money.currencyCode
            )
          : money.currencyCode,
        localizedString: formatMoney(money, { stripTrailingZeros: false }),
        withoutTrailingZeros: formatMoney(money),
        withoutTrailingZerosAndCurrency: numberFormatter(locale, {
          minimumFractionDigits: whole ? 0 : 2,
          maximumFractionDigits: whole ? 0 : 2,
        }).format(amount),
        parts,
      };
    },
    formatNumber(value, options = {}) {
      return numberFormatter(locale, options).format(value);
    },
    formatDate(value, options = { dateStyle: 'medium' }) {
      const date = value instanceof Date ? value : new Date(value);
      return dateFormatter(locale, { timeZone, ...options }).format(date);
    },
  };
}
