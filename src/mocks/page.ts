import { ApiPage, MediaSource } from "@codegen/schema-client";

export const mockPage: ApiPage = {
  __typename: 'Page',

  cover: {
    __typename: 'File',
    id: 'page-cover-1',
    iid: 'uuid-page-cover-1',
    source: MediaSource.Url,
    url: 'https://marketplace.canva.com/EAF9lPin1YI/1/0/1131w/canva-blue-simple-aesthetic-floral-notebook-cover-page-a4-NgwHPaVi_fc.jpg',
  },

  createdAt: new Date().toISOString(),
  description: 'With beefy batteries and the A18 chipset, these colorful iPhones have everything you need and not much you don’t.',
  excerpt: "Short description.",
  /** Gallery of additional images with cursor-based pagination. */
  gallery: {
    __typename: 'GalleryConnection',
    edges: [{
      __typename: 'GalleryEdge',
      cursor: '1',
      node: {
        __typename: 'File',
        id: 'page-gallery-node-1',
        iid: 'uuid-page-gallery-node-1',
        source: MediaSource.Url,
        url: 'https://marketplace.canva.com/EAF9lPin1YI/1/0/1131w/canva-blue-simple-aesthetic-floral-notebook-cover-page-a4-NgwHPaVi_fc.jpg',
      },
    }, {
      __typename: 'GalleryEdge',
      cursor: '2',
      node: {
        __typename: 'File',
        id: 'page-gallery-node-2',
        iid: 'uuid-page-gallery-node-2',
        source: MediaSource.Url,
        url: 'https://marketplace.canva.com/EAGH1hK4T80/1/0/1236w/canva-brown-white-cute-aesthetic-journal-cover-vESgGu0NaqA.jpg',
      },
    }],
    pageInfo: {
      __typename: "PageInfo",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    totalCount: 2,
  },

  handle: 'mock-page',
  id: 'mock-page-1',
  iid: 'uuid-mock-page-1',
  pageType: 'page type',
  title: 'Mock page',
  updatedAt: new Date().toISOString(),
}
