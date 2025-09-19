import { ApiArticle, MediaSource } from "@codegen/schema-client";

export const mockArticle: ApiArticle = {
  __typename: 'Article',
  articleType: 'Julian Chokkattu',

  cover: {
    __typename: 'File',
    id: 'article-cover-1',
    iid: 'uuid-article-cover-1',
    source: MediaSource.Url,
    url: 'https://media.wired.com/photos/66ee1eaed55aa1e3e813816d/master/w_1600,c_limit/Apple-iPhone-16-vs-iPhone-16-Plus-(pink)-(blue)-Reviewer-Photo-SOURCE-Julian-Chokkattu.jpg',
  },

  createdAt: new Date().toISOString(),
  description: 'With beefy batteries and the A18 chipset, these colorful iPhones have everything you need and not much you don’t.',
  excerpt: "Short description.",
  gallery: {
    __typename: 'GalleryConnection',
    edges: [{
      __typename: 'GalleryEdge',
      cursor: '1',
      node: {
        __typename: 'File',
        id: 'article-gallery-node-1',
        iid: 'uuid-article-gallery-node-1',
        source: MediaSource.Url,
        url: 'https://media.wired.com/photos/66ee1eaed55aa1e3e813816d/master/w_1600,c_limit/Apple-iPhone-16-vs-iPhone-16-Plus-(pink)-(blue)-Reviewer-Photo-SOURCE-Julian-Chokkattu.jpg',
      },
    }, {
      __typename: 'GalleryEdge',
      cursor: '2',
      node: {
        __typename: 'File',
        id: 'article-gallery-node-2',
        iid: 'uuid-article-gallery-node-2',
        source: MediaSource.Url,
        url: 'https://media.wired.com/photos/66f1a1edb7112203a8b433f0/master/w_1600,c_limit/Apple-iPhone-16-and-iPhone-16-Plus-Sides-Buttons-Pink-Blue-Reviewer-Photo-SOURCE-Julian-Chokkattu.jpg',
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

  handle: 'review-apple-iphone-16-and-iphone-16-plus',
  id: 'article-1',
  iid: 'uuid-article-1',
  title: 'Review: Apple iPhone 16 and iPhone 16 Plus',
  updatedAt: new Date().toISOString(),
}
