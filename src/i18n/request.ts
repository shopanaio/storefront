import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  // Map legacy 'ua' to standard 'uk' locale code
  const candidate = requested === 'ua' ? 'uk' : requested;
  const locale = hasLocale(routing.locales, candidate)
    ? candidate
    : routing.defaultLocale;
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
