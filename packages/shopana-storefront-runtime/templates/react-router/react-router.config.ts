import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'app',
  ssr: true,
  // The storefront has a few routes: the browser gets all of them with the document, so a
  // client navigation asks the server nothing.
  routeDiscovery: { mode: 'initial' },
} satisfies Config;
