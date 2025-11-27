import { createSDKPage } from '@shopana/storefront-sdk/next/page';
import { environmentConfig } from '@src/config/environment.config';
import '@src/modules';

const { Page, generateMetadata } = createSDKPage({
  environmentConfig,
});

export default Page;
export { generateMetadata };
