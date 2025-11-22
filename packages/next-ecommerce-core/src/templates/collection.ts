import dynamic from 'next/dynamic';
import type { PageTemplate } from '../core/types';
import type { CollectionPageData } from '../sdk/types';

const CollectionGrid = dynamic(() => import('../sections/CollectionGrid'));

export const collectionTemplate: PageTemplate<CollectionPageData> = {
  name: 'collection',
  sections: [
    {
      id: 'collection-grid',
      component: CollectionGrid,
      settings: {
        title: 'Collection',
      },
    },
  ],
};
