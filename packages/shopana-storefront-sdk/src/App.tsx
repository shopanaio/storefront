'use client';

import { ApolloAppProvider } from './next/apollo/ApolloProvider';
import { AppProviders, type AppProvidersProps } from './AppProviders';

export type AppProps = AppProvidersProps;

/** The storefront providers over the Next.js Apollo integration (streaming SSR, RSC cache). */
export function App({
  environmentConfig,
  apolloInitialState,
  ...props
}: AppProps) {
  return (
    <ApolloAppProvider
      environmentConfig={environmentConfig}
      initialState={apolloInitialState}
      locale={props.locale.tag}
    >
      <AppProviders {...props} environmentConfig={environmentConfig} />
    </ApolloAppProvider>
  );
}
