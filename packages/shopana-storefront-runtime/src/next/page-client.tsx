'use client';

// The same text as the React Router entry: each runtime has its own `./page-not-found`.
export * from '../core/page-client';
export {
  PageNotFound,
  PageNotFoundError,
  isPageNotFoundError,
} from './page-not-found';
