/** i18n scope of the module: messages live under `Modules.novaPoshta`. */
export const NOVA_POSHTA_SCOPE = 'novaPoshta';

/**
 * Loads Nova Poshta translations for the given locale.
 * Returns plain object that will be placed under Modules.novaPoshta namespace.
 */
export async function loadNovaPoshtaMessages(locale: string) {
  switch (locale) {
    case 'uk':
      return (await import('./uk.json')).default;
    default:
      return (await import('./en.json')).default;
  }
}
