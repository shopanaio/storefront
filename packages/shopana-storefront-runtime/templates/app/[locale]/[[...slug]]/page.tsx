import { createRuntimePage } from '@shopana/storefront/next/page';
import { environmentConfig } from '@src/config/environment.config';
import { runtimePages } from '@src/runtime/pages';
import ClientPage from './client-page';

const { Page, generateMetadata } = createRuntimePage({
  environmentConfig,
  pages: runtimePages,
  ClientPage,
  modulesContext: require.context(
    '../../../../src/modules',
    true,
    /register\.(t|j)sx?$/
  ),
});

export default Page;
export { generateMetadata };
