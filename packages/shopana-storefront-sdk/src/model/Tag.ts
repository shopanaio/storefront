import type { Connection } from './Connection';

/**
 * Tag - product tag
 */
export interface Tag {
  /** Global unique identifier */
  id: string;
  /** URL-friendly handle */
  handle: string;
  /** Tag title */
  title: string;
}

/**
 * TagConnection - paginated collection of tags
 */
export type TagConnection = Connection<Tag>;
