/** The address of the server request a page renders for, as the runtime middleware saw it. */
export interface SDKRequestContext {
  url: string;
  /** Pathname with the locale segment, as requested. */
  pathname: string;
  search: string;
  host: string;
  searchParams: URLSearchParams;
}
