/**
 * Loads NovaPoshta translations for the given locale.
 * Returns plain object that will be placed under Modules.novaposta namespace.
 */
export async function loadNovapostaMessages(locale: string) {
  switch (locale) {
    case "uk":
      return (await import("./uk.json")).default;
    default:
      return (await import("./en.json")).default;
  }
}
