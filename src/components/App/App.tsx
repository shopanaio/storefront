"use client";

import { SessionStoreProvider } from "@src/providers/session-store-provider";
import CartProvider from "@src/providers/cart";
import { Layout } from "@src/components/Layout/Layout";
import { Theme } from "@src/components/Theme/Theme";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "../../messages/en.json";
import ukMessages from "../../messages/uk.json";
import { SerializablePreloadedQuery } from "@src/relay/loadSerializableQuery";
import { ConcreteRequest, OperationType } from "relay-runtime";

import { cmsPick } from "@src/cms/pick";

interface IAppProps {
  children: React.ReactNode;
  locale: string;
  preloadedSessionQuery?: SerializablePreloadedQuery<
    ConcreteRequest,
    OperationType
  >;
}

const App = ({ children, locale, preloadedSessionQuery }: IAppProps) => {
  let messages;

  if (locale === "uk") {
    messages = ukMessages;
  } else {
    messages = enMessages;
  }

  let initialSessionState;
  const sessionData = preloadedSessionQuery?.response;

  if (sessionData) {
    const sessionHandlers = cmsPick({
      shopify: () => ({
        session: {
          user: preloadedSessionQuery?.response?.data?.customer,
          token: preloadedSessionQuery?.variables?.customerAccessToken,
          expiresAt: preloadedSessionQuery?.expiresAt,
        },
      }),
      shopana: () => ({
        session: {
          user: preloadedSessionQuery?.response?.data?.session?.user,
          token: preloadedSessionQuery?.response?.data?.session?.accessToken,
          expiresAt: preloadedSessionQuery?.response?.data?.session?.expiresAt,
        },
      }),
    });

    initialSessionState = sessionHandlers();
  }

  console.log("initialSessionState", initialSessionState);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      // TODO: we need to get the time zone from the store
      timeZone="Europe/Paris"
    >
      <SessionStoreProvider initialState={initialSessionState}>
        <CartProvider>
          <Theme>
            <Layout>{children}</Layout>
          </Theme>
        </CartProvider>
      </SessionStoreProvider>
    </NextIntlClientProvider>
  );
};

export default App;
