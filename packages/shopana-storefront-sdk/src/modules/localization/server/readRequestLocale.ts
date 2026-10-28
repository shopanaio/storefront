import { readServerRequestHeaders } from '../../../server/requestScope';
import { STOREFRONT_LOCALE_HEADER } from '../core/constants';

/** BCP 47 tag of the current server request locale, as the runtime middleware resolved it. */
export async function readRequestLocale(): Promise<string | null> {
  return (await readServerRequestHeaders()).get(STOREFRONT_LOCALE_HEADER);
}
