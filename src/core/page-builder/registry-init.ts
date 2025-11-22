/**
 * Page Builder Registry Initialization
 * This file registers all sections, blocks, and layouts
 */

import { registerSection, registerBlock, registerLayout } from './registry';

// Import block schemas
import { buttonSchema } from '@src/blocks/Button/schema';
import { imageSchema } from '@src/blocks/Image/schema';
import { textSchema } from '@src/blocks/Text/schema';

// Import section schemas
import { heroSchema } from '@src/sections/Hero/schema';
import { featuresSchema } from '@src/sections/Features/schema';
import { footerSchema } from '@src/sections/Footer/schema';

// Import layout schemas
import { defaultLayoutSchema } from '@src/layouts/DefaultLayout/schema';
import { fullWidthLayoutSchema } from '@src/layouts/FullWidthLayout/schema';

// Register Blocks with dynamic loaders
registerBlock(
  'button',
  async () => await import('@src/blocks/Button/Button'),
  buttonSchema
);
registerBlock(
  'image',
  async () => await import('@src/blocks/Image/Image'),
  imageSchema
);
registerBlock(
  'text',
  async () => await import('@src/blocks/Text/Text'),
  textSchema
);

// Register Sections with dynamic loaders
registerSection(
  'hero',
  async () => await import('@src/sections/Hero/Hero'),
  heroSchema
);
registerSection(
  'features',
  async () => await import('@src/sections/Features/Features'),
  featuresSchema
);
registerSection(
  'footer',
  async () => await import('@src/sections/Footer/Footer'),
  footerSchema
);

// Register Layouts with dynamic loaders
registerLayout(
  'default',
  async () => await import('@src/layouts/DefaultLayout/DefaultLayout'),
  defaultLayoutSchema
);
registerLayout(
  'full-width',
  async () => await import('@src/layouts/FullWidthLayout/FullWidthLayout'),
  fullWidthLayoutSchema
);
