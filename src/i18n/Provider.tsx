import { NextIntlClientProvider } from "next-intl";
import { messages } from "@src/i18n/messages";

interface IntlProviderProps {
  children: React.ReactNode;
  locale: string;
  timeZone?: string;
}

export async function IntlProvider({
  children,
  locale,
  timeZone = "Europe/Paris"
}: IntlProviderProps) {
  const currentMessages = messages[locale];

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={currentMessages}
      timeZone={timeZone}
    >
      {children}
    </NextIntlClientProvider>
  );
}
