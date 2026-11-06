import { createRuntimePage } from '@shopana/storefront/next/page';
import { environmentConfig } from '@src/config/environment.config';
import { storefrontRouting } from '@src/config/routing.config';
import { runtimePages } from '@src/runtime/pages';

const { Page, generateMetadata } = createRuntimePage({
  environmentConfig,
  routing: storefrontRouting,
  pages: runtimePages,
  modulesContext: require.context(
    '../../../../src/modules',
    true,
    /register\.(t|j)sx?$/
  ),
});

export default Page;
export { generateMetadata };
