// Re-export page handler from the framework
// All logic (switch, dynamic imports, data loading) is handled in the package
import { createSDKPage } from '@shopana/storefront-sdk/next/page';
import { environmentConfig } from '@src/config/environment.config';

const { Page, generateMetadata } = createSDKPage({ environmentConfig });

export default Page;
export { generateMetadata };
