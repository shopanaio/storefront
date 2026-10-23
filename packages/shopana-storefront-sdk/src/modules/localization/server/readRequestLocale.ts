import { STOREFRONT_LOCALE_HEADER } from '../core/constants';

/** BCP 47 tag of the current server request locale, as the runtime middleware resolved it. */
export async function readRequestLocale(): Promise<string | null> {
  const { headers } = await import('next/headers');
  return (await headers()).get(STOREFRONT_LOCALE_HEADER);
}
