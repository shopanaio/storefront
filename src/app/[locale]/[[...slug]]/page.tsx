import { createSDKPage } from '@shopana/storefront-sdk/next/page';
import { environmentConfig } from '@src/config/environment.config';

const { Page, generateMetadata } = createSDKPage({
  environmentConfig,
  modulesContext: require.context('../../../modules', true, /register\.(t|j)sx?$/),
});

export default Page;
export { generateMetadata };
