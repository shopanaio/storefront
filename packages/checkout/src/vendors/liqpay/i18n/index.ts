/**
 * Loads LiqPay translations for the given locale.
 * Returns plain object that will be placed under Modules.liqpay namespace.
 */
export async function loadLiqPayMessages(locale: string) {
  switch (locale) {
    case 'uk':
      return (await import('./uk.json')).default;
    default:
      return (await import('./en.json')).default;
  }
}
