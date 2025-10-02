/**
 * Loads Bank Transfer translations for the given locale.
 * Returns plain object that will be placed under Modules.bankTransfer namespace.
 */
export async function loadBankTransferMessages(locale: string) {
  switch (locale) {
    case 'uk':
      return (await import('./uk.json')).default;
    default:
      return (await import('./en.json')).default;
  }
}
